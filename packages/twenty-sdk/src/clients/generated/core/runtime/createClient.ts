// @ts-nocheck

import  { type BatchOptions, createFetcher } from './fetcher'
import type { ExecutionResult, LinkedType } from './types'
import {
    generateGraphqlOperation,
    type GraphqlOperation,
} from './generateGraphqlOperation'

export type Headers =
    | HeadersInit
    | (() => HeadersInit)
    | (() => Promise<HeadersInit>)

export type BaseFetcher = (
    operation: GraphqlOperation | GraphqlOperation[],
) => Promise<ExecutionResult | ExecutionResult[]>

export type ClientOptions = Omit<RequestInit, 'body' | 'headers'> & {
    url?: string
    batch?: BatchOptions | boolean
    fetcher?: BaseFetcher
    fetch?: Function
    headers?: Headers
}

export const createClient = ({
    queryRoot,
    mutationRoot,
    subscriptionRoot,
    ...options
}: ClientOptions & {
    queryRoot?: LinkedType
    mutationRoot?: LinkedType
    subscriptionRoot?: LinkedType
}) => {
    const fetcher = createFetcher(options)
    const client: {
        query?: Function
        mutation?: Function
    } = {}

    if (queryRoot) {
        client.query = (request: any) => {
            if (!queryRoot) throw new Error('queryRoot argument is missing')

            try {
                return fetcher(
                    generateGraphqlOperation('query', queryRoot, request),
                )
            } catch (error) {
                return Promise.reject(error)
            }
        }
    }
    if (mutationRoot) {
        client.mutation = (request: any) => {
            if (!mutationRoot)
                throw new Error('mutationRoot argument is missing')

            try {
                return fetcher(
                    generateGraphqlOperation('mutation', mutationRoot, request),
                )
            } catch (error) {
                return Promise.reject(error)
            }
        }
    }

    return client as any
}
