// @ts-nocheck
import type { LinkedField, LinkedType } from './types'

export interface Args {
    [arg: string]: any | undefined
}

export interface Fields {
    [field: string]: Request
}

export type Request = boolean | number | Fields

export interface Variables {
    [name: string]: {
        value: any
        typing: [LinkedType, string]
    }
}

export interface Context {
    root: LinkedType
    varCounter: number
    variables: Variables
    fragmentCounter: number
    fragments: string[]
}

export interface GraphqlOperation {
    query: string
    variables?: { [name: string]: any }
    operationName?: string
}

// ---- Convention-based type inference (Twenty Core API) ----

type ResolverPattern = {
    regex: RegExp
    getArgType: (objectName: string, argName: string) => string | null
}

const RESOLVER_PATTERNS: ResolverPattern[] = [
    {
        regex: /^create(.+)$/,
        getArgType: (objectName, argName) => {
            if (argName === 'data') return `${objectName}CreateInput!`
            if (argName === 'upsert') return 'Boolean'
            return null
        },
    },
    {
        regex: /^update(.+)$/,
        getArgType: (objectName, argName) => {
            if (argName === 'id') return 'UUID!'
            if (argName === 'data') return `${objectName}UpdateInput!`
            if (argName === 'filter') return `${objectName}FilterInput!`
            return null
        },
    },
    {
        regex: /^delete(.+)$/,
        getArgType: (objectName, argName) => {
            if (argName === 'id') return 'UUID!'
            if (argName === 'filter') return `${objectName}FilterInput!`
            return null
        },
    },
    {
        regex: /^destroy(.+)$/,
        getArgType: (objectName, argName) => {
            if (argName === 'id') return 'UUID!'
            if (argName === 'filter') return `${objectName}FilterInput!`
            return null
        },
    },
    {
        regex: /^restore(.+)$/,
        getArgType: (objectName, argName) => {
            if (argName === 'id') return 'UUID!'
            if (argName === 'filter') return `${objectName}FilterInput!`
            return null
        },
    },
    {
        regex: /^merge(.+)$/,
        getArgType: (_objectName, argName) => {
            if (argName === 'ids') return '[UUID!]!'
            if (argName === 'conflictPriorityIndex') return 'Int!'
            if (argName === 'dryRun') return 'Boolean'
            return null
        },
    },
]

const QUERY_COMMON_ARG_TYPES: Record<string, string> = {
    first: 'Int',
    last: 'Int',
    offset: 'Int',
    offsetForRecords: 'Int',
    limit: 'Int',
    before: 'String',
    after: 'String',
    id: 'UUID!',
    ids: '[UUID]',
    upsert: 'Boolean',
    dryRun: 'Boolean',
    conflictPriorityIndex: 'Int!',
    viewId: 'UUID',
}

const inferArgTypeForUnprefixedResolver = (
    resolverName: string,
    argName: string,
): string | null => {
    const commonType = QUERY_COMMON_ARG_TYPES[argName]

    if (commonType) return commonType

    let objectName = resolverName

    if (resolverName.endsWith('Duplicates')) {
        objectName = resolverName.slice(0, -'Duplicates'.length)
    } else if (resolverName.endsWith('GroupBy')) {
        objectName = resolverName.slice(0, -'GroupBy'.length)
    }

    const pascalObjectName =
        objectName.charAt(0).toUpperCase() + objectName.slice(1)

    if (argName === 'filter') return `${pascalObjectName}FilterInput`
    if (argName === 'orderBy') return `[${pascalObjectName}OrderByInput]`
    if (argName === 'orderByForRecords')
        return `[${pascalObjectName}OrderByInput]`
    if (argName === 'groupBy') return `[${pascalObjectName}GroupByInput!]!`
    if (argName === 'data') return `[${pascalObjectName}CreateInput!]`

    return null
}

const inferArgType = (operationName: string, argName: string): string => {
    for (const pattern of RESOLVER_PATTERNS) {
        const match = operationName.match(pattern.regex)

        if (!match) continue

        const objectName = match[1]!
        const resolved = pattern.getArgType(objectName, argName)

        if (resolved) return resolved
    }

    const unprefixedResult = inferArgTypeForUnprefixedResolver(
        operationName,
        argName,
    )

    if (unprefixedResult) return unprefixedResult

    throw new Error(
        `Cannot infer GraphQL type for argument '${argName}' ` +
            `on operation '${operationName}'. ` +
            `Run 'twenty app:build' to generate a typed client.`,
    )
}

// ---- End convention-based inference ----

const parseRequest = (
    request: Request | undefined,
    ctx: Context,
    path: string[],
): string => {
    if (typeof request === 'object' && '__args' in request) {
        const args: any = request.__args
        let fields: Request | undefined = { ...request }
        delete fields.__args
        const argNames = Object.keys(args)

        if (argNames.length === 0) {
            return parseRequest(fields, ctx, path)
        }

        const field = getFieldFromPath(ctx.root, path)

        const argStrings = argNames.map((argName) => {
            ctx.varCounter++
            const varName = `v${ctx.varCounter}`

            // Try the type map first (available when genql codegen has run)
            const typing = field?.args && field.args[argName]

            if (typing) {
                ctx.variables[varName] = {
                    value: args[argName],
                    typing,
                }
            } else {
                // Fallback: infer from Twenty's resolver naming conventions
                const operationName = path[0] || ''
                const inferredType = inferArgType(operationName, argName)

                ctx.variables[varName] = {
                    value: args[argName],
                    typing: [{ name: inferredType }, inferredType],
                }
            }

            return `${argName}:$${varName}`
        })
        return `(${argStrings})${parseRequest(fields, ctx, path)}`
    } else if (typeof request === 'object' && Object.keys(request).length > 0) {
        const fields = request
        const fieldNames = Object.keys(fields).filter((k) => Boolean(fields[k]))

        if (fieldNames.length === 0) {
            throw new Error(
                `field selection should not be empty: ${path.join('.')}`,
            )
        }

        const field = path.length > 0 ? getFieldFromPath(ctx.root, path) : null
        const type = field ? field.type : ctx.root
        const scalarFields = type?.scalar

        let scalarFieldsFragment: string | undefined

        if (fieldNames.includes('__scalar')) {
            const falsyFieldNames = new Set(
                Object.keys(fields).filter((k) => !Boolean(fields[k])),
            )
            if (scalarFields?.length) {
                ctx.fragmentCounter++
                scalarFieldsFragment = `f${ctx.fragmentCounter}`

                ctx.fragments.push(
                    `fragment ${scalarFieldsFragment} on ${
                        type.name
                    }{${scalarFields
                        .filter((f) => !falsyFieldNames.has(f))
                        .join(',')}}`,
                )
            }
        }

        const fieldsSelection = fieldNames
            .filter((f) => !['__scalar', '__name'].includes(f))
            .map((f) => {
                const parsed = parseRequest(fields[f], ctx, [...path, f])

                if (f.startsWith('on_')) {
                    ctx.fragmentCounter++
                    const implementationFragment = `f${ctx.fragmentCounter}`

                    const typeMatch = f.match(/^on_(.+)/)

                    if (!typeMatch || !typeMatch[1])
                        throw new Error('match failed')

                    ctx.fragments.push(
                        `fragment ${implementationFragment} on ${typeMatch[1]}${parsed}`,
                    )

                    return `...${implementationFragment}`
                } else {
                    return `${f}${parsed}`
                }
            })
            .concat(scalarFieldsFragment ? [`...${scalarFieldsFragment}`] : [])
            .join(',')

        return `{${fieldsSelection}}`
    } else {
        return ''
    }
}

export const generateGraphqlOperation = (
    operation: 'query' | 'mutation' | 'subscription',
    root: LinkedType,
    fields?: Fields,
): GraphqlOperation => {
    const ctx: Context = {
        root: root,
        varCounter: 0,
        variables: {},
        fragmentCounter: 0,
        fragments: [],
    }
    const result = parseRequest(fields, ctx, [])

    const varNames = Object.keys(ctx.variables)

    const varsString =
        varNames.length > 0
            ? `(${varNames.map((v) => {
                  const variableType = ctx.variables[v].typing[1]
                  return `$${v}:${variableType}`
              })})`
            : ''

    const operationName = fields?.__name || ''

    return {
        query: [
            `${operation} ${operationName}${varsString}${result}`,
            ...ctx.fragments,
        ].join(','),
        variables: Object.keys(ctx.variables).reduce<{ [name: string]: any }>(
            (r, v) => {
                r[v] = ctx.variables[v].value
                return r
            },
            {},
        ),
        ...(operationName ? { operationName: operationName.toString() } : {}),
    }
}

// Gracefully returns undefined when the type map is empty (stub mode),
// instead of throwing like the original genql version.
export const getFieldFromPath = (
    root: LinkedType | undefined,
    path: string[],
): LinkedField | undefined => {
    let current: LinkedField | undefined

    if (!root) return undefined

    if (path.length === 0) return undefined

    for (const f of path) {
        const type = current ? current.type : root

        if (!type?.fields) return undefined

        const possibleTypes = Object.keys(type.fields)
            .filter((i) => i.startsWith('on_'))
            .reduce(
                (types, fieldName) => {
                    const field = type.fields && type.fields[fieldName]
                    if (field) types.push(field.type)
                    return types
                },
                [type],
            )

        let field: LinkedField | null = null

        for (const possibleType of possibleTypes) {
            const found = possibleType.fields && possibleType.fields[f]
            if (found) {
                field = found
                break
            }
        }

        if (!field) return undefined

        current = field
    }

    return current
}
