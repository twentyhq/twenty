// @ts-nocheck
import { QueryBatcher } from './batcher'

import type { ClientOptions } from './createClient'
import type { GraphqlOperation } from './generateGraphqlOperation'
import { GenqlError } from './error'

export interface Fetcher {
    (gql: GraphqlOperation): Promise<any>
}

export type BatchOptions = {
    batchInterval?: number // ms
    maxBatchSize?: number
}

const DEFAULT_BATCH_OPTIONS = {
    maxBatchSize: 10,
    batchInterval: 40,
}

export const createFetcher = ({
    url,
    headers = {},
    fetcher,
    fetch: _fetch,
    batch = false,
    ...rest
}: ClientOptions): Fetcher => {
    if (!url && !fetcher) {
        throw new Error('url or fetcher is required')
    }

    fetcher = fetcher || (async (body) => {
        let headersObject =
            typeof headers == 'function' ? await headers() : headers
        headersObject = headersObject || {}
        if (typeof fetch === 'undefined' && !_fetch) {
            throw new Error(
                'Global `fetch` function is not available, pass a fetch polyfill to Genql `createClient`',
            )
        }
        let fetchImpl = _fetch || fetch
        const res = await fetchImpl(url!, {
            headers: {
                'Content-Type': 'application/json',
                ...headersObject,
            },
            method: 'POST',
            body: JSON.stringify(body),
            ...rest,
        })
        if (!res.ok) {
            throw new Error(`${res.statusText}: ${await res.text()}`)
        }
        const json = await res.json()
        return json
    })

    if (!batch) {
        return async (body) => {
            const json = await fetcher!(body)
            if (Array.isArray(json)) {
                return json.map((json) => {
                    if (json?.errors?.length) {
                        throw new GenqlError(json.errors || [], json.data)
                    }
                    return json.data
                })
            } else {
                if (json?.errors?.length) {
                    throw new GenqlError(json.errors || [], json.data)
                }
                return json.data
            }
        }
    }

    const batcher = new QueryBatcher(
        async (batchedQuery) => {
            // console.log(batchedQuery) // [{ query: 'query{user{age}}', variables: {} }, ...]
            const json = await fetcher!(batchedQuery)
            return json as any
        },
        batch === true ? DEFAULT_BATCH_OPTIONS : batch,
    )

    return async ({ query, variables }) => {
        const json = await batcher.fetch(query, variables)
        if (json?.data) {
            return json.data
        }
        throw new Error(
            'Genql batch fetcher returned unexpected result ' + JSON.stringify(json),
        )
    }
}
