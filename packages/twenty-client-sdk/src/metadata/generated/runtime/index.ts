// @ts-nocheck
export { createClient } from './createClient'
export type { ClientOptions } from './createClient'
export type { FieldsSelection } from './typeSelection'
export { generateGraphqlOperation } from './generateGraphqlOperation'
export type { GraphqlOperation } from './generateGraphqlOperation'
export { linkTypeMap } from './linkTypeMap'
// export { Observable } from 'zen-observable-ts'
export { createFetcher } from './fetcher'
export { GenqlError } from './error'
export const everything = {
    __scalar: true,
}
