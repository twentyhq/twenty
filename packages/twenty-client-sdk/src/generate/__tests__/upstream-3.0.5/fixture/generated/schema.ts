// @ts-nocheck
export type Scalars = {
    String: string,
    Float: number,
    Int: number,
    Boolean: boolean,
    ID: string,
}

export type SomeEnum = 'X' | 'Y' | 'Z'

export type SomeEnum2 = 'hello' | 'world'

export interface Query {
    /** Some description */
    repository: Repository
    optionalArgs: Repository
    user?: User
    someScalarValue?: Scalars['String']
    recursiveType?: (RecursiveType | undefined)[]
    throwsError: Scalars['String']
    account?: Account
    coordinates?: Point
    unionThatImplementsInterface?: GenericError
    InterfaceNotImplemented?: InterfaceNotImplemented
    __typename: 'Query'
}

export interface RecursiveType {
    value?: Scalars['String']
    recurse?: RecursiveType
    __typename: 'RecursiveType'
}

export interface Repository {
    createdAt: Scalars['String']
    forks?: ForkConnection
    __typename: 'Repository'
}

export interface ForkConnection {
    edges?: (ForkEdge | undefined)[]
    __typename: 'ForkConnection'
}

export interface ForkEdge {
    cursor?: Scalars['String']
    node?: Fork
    __typename: 'ForkEdge'
}

export interface Fork {
    name?: Scalars['String']
    number?: Scalars['Int']
    __typename: 'Fork'
}

export interface User {
    /** Some description */
    name?: Scalars['String']
    common?: Scalars['Int']
    __typename: 'User'
}

export interface Subscription {
    user?: User
    __typename: 'Subscription'
}

export type Account = (User | Guest) & { __isUnion?: true }

export interface Guest {
    anonymous?: Scalars['Boolean']
    common?: Scalars['Int']
    __typename: 'Guest'
}

export interface House {
    owner?: User
    x?: Scalars['String']
    y?: Scalars['String']
    __typename: 'House'
}

export interface Bank {
    address?: Scalars['String']
    x?: Scalars['String']
    y?: Scalars['String']
    __typename: 'Bank'
}

export type Point = (House | Bank) & { __isUnion?: true }

export type ClientError = (ClientErrorNameAlreadyTaken | ClientErrorNameInvalid) & { __isUnion?: true }

export interface ClientErrorNameAlreadyTaken {
    message: Scalars['String']
    ownProp1?: Scalars['String']
    __typename: 'ClientErrorNameAlreadyTaken'
}

export interface ClientErrorNameInvalid {
    message: Scalars['String']
    ownProp2?: Scalars['String']
    __typename: 'ClientErrorNameInvalid'
}

export interface ClientErrorWithoutInterface {
    ownProp3?: Scalars['String']
    __typename: 'ClientErrorWithoutInterface'
}

export type GenericError = (ClientErrorNameAlreadyTaken | ClientErrorNameInvalid | ClientErrorWithoutInterface) & { __isUnion?: true }

export interface InterfaceNotImplemented {
    id: Scalars['ID']
    title?: Scalars['String']
    url?: Scalars['String']
    permalink?: Scalars['String']
    entry_id?: Scalars['ID']
    __typename: string
}

export interface QueryGenqlSelection{
    /** Some description */
    repository?: (RepositoryGenqlSelection & { __args: {name: Scalars['String'], owner?: (Scalars['String'] | null)} })
    optionalArgs?: (RepositoryGenqlSelection & { __args?: {name?: (Scalars['String'] | null), owner?: (Scalars['String'] | null)} })
    user?: UserGenqlSelection
    someScalarValue?: { __args: {x?: (Scalars['Float'] | null)} } | boolean | number
    recursiveType?: (RecursiveTypeGenqlSelection & { __args?: {requiredVal?: (Scalars['String'][] | null)} })
    throwsError?: boolean | number
    account?: AccountGenqlSelection
    coordinates?: PointGenqlSelection
    unionThatImplementsInterface?: (GenericErrorGenqlSelection & { __args?: {typename?: (Scalars['String'] | null)} })
    InterfaceNotImplemented?: InterfaceNotImplementedGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RecursiveTypeGenqlSelection{
    value?: boolean | number
    recurse?: (RecursiveTypeGenqlSelection & { __args?: {arg?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RepositoryGenqlSelection{
    createdAt?: boolean | number
    forks?: (ForkConnectionGenqlSelection & { __args?: {filter?: (Scalars['String'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ForkConnectionGenqlSelection{
    edges?: ForkEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ForkEdgeGenqlSelection{
    cursor?: boolean | number
    node?: ForkGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ForkGenqlSelection{
    name?: boolean | number
    number?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserGenqlSelection{
    /** Some description */
    name?: boolean | number
    common?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SubscriptionGenqlSelection{
    user?: UserGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AccountGenqlSelection{
    on_User?:UserGenqlSelection,
    on_Guest?:GuestGenqlSelection,
    __typename?: boolean | number
}

export interface GuestGenqlSelection{
    anonymous?: boolean | number
    common?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface HouseGenqlSelection{
    owner?: UserGenqlSelection
    x?: boolean | number
    y?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BankGenqlSelection{
    address?: boolean | number
    x?: boolean | number
    y?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PointGenqlSelection{
    x?: boolean | number
    y?: boolean | number
    on_House?: HouseGenqlSelection
    on_Bank?: BankGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientErrorGenqlSelection{
    message?: boolean | number
    on_ClientErrorNameAlreadyTaken?: ClientErrorNameAlreadyTakenGenqlSelection
    on_ClientErrorNameInvalid?: ClientErrorNameInvalidGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientErrorNameAlreadyTakenGenqlSelection{
    message?: boolean | number
    ownProp1?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientErrorNameInvalidGenqlSelection{
    message?: boolean | number
    ownProp2?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ClientErrorWithoutInterfaceGenqlSelection{
    ownProp3?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface GenericErrorGenqlSelection{
    on_ClientErrorNameAlreadyTaken?:ClientErrorNameAlreadyTakenGenqlSelection,
    on_ClientErrorNameInvalid?:ClientErrorNameInvalidGenqlSelection,
    on_ClientErrorWithoutInterface?:ClientErrorWithoutInterfaceGenqlSelection,
    on_ClientError?: ClientErrorGenqlSelection,
    __typename?: boolean | number
}

export interface InterfaceNotImplementedGenqlSelection{
    id?: boolean | number
    title?: boolean | number
    url?: boolean | number
    permalink?: boolean | number
    entry_id?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const RecursiveType_possibleTypes: string[] = ['RecursiveType']
    export const isRecursiveType = (obj?: { __typename?: any } | null): obj is RecursiveType => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRecursiveType"')
      return RecursiveType_possibleTypes.includes(obj.__typename)
    }
    


    const Repository_possibleTypes: string[] = ['Repository']
    export const isRepository = (obj?: { __typename?: any } | null): obj is Repository => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRepository"')
      return Repository_possibleTypes.includes(obj.__typename)
    }
    


    const ForkConnection_possibleTypes: string[] = ['ForkConnection']
    export const isForkConnection = (obj?: { __typename?: any } | null): obj is ForkConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isForkConnection"')
      return ForkConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ForkEdge_possibleTypes: string[] = ['ForkEdge']
    export const isForkEdge = (obj?: { __typename?: any } | null): obj is ForkEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isForkEdge"')
      return ForkEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Fork_possibleTypes: string[] = ['Fork']
    export const isFork = (obj?: { __typename?: any } | null): obj is Fork => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFork"')
      return Fork_possibleTypes.includes(obj.__typename)
    }
    


    const User_possibleTypes: string[] = ['User']
    export const isUser = (obj?: { __typename?: any } | null): obj is User => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUser"')
      return User_possibleTypes.includes(obj.__typename)
    }
    


    const Subscription_possibleTypes: string[] = ['Subscription']
    export const isSubscription = (obj?: { __typename?: any } | null): obj is Subscription => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSubscription"')
      return Subscription_possibleTypes.includes(obj.__typename)
    }
    


    const Account_possibleTypes: string[] = ['User','Guest']
    export const isAccount = (obj?: { __typename?: any } | null): obj is Account => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAccount"')
      return Account_possibleTypes.includes(obj.__typename)
    }
    


    const Guest_possibleTypes: string[] = ['Guest']
    export const isGuest = (obj?: { __typename?: any } | null): obj is Guest => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGuest"')
      return Guest_possibleTypes.includes(obj.__typename)
    }
    


    const House_possibleTypes: string[] = ['House']
    export const isHouse = (obj?: { __typename?: any } | null): obj is House => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isHouse"')
      return House_possibleTypes.includes(obj.__typename)
    }
    


    const Bank_possibleTypes: string[] = ['Bank']
    export const isBank = (obj?: { __typename?: any } | null): obj is Bank => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBank"')
      return Bank_possibleTypes.includes(obj.__typename)
    }
    


    const Point_possibleTypes: string[] = ['House','Bank']
    export const isPoint = (obj?: { __typename?: any } | null): obj is Point => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPoint"')
      return Point_possibleTypes.includes(obj.__typename)
    }
    


    const ClientError_possibleTypes: string[] = ['ClientErrorNameAlreadyTaken','ClientErrorNameInvalid']
    export const isClientError = (obj?: { __typename?: any } | null): obj is ClientError => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientError"')
      return ClientError_possibleTypes.includes(obj.__typename)
    }
    


    const ClientErrorNameAlreadyTaken_possibleTypes: string[] = ['ClientErrorNameAlreadyTaken']
    export const isClientErrorNameAlreadyTaken = (obj?: { __typename?: any } | null): obj is ClientErrorNameAlreadyTaken => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientErrorNameAlreadyTaken"')
      return ClientErrorNameAlreadyTaken_possibleTypes.includes(obj.__typename)
    }
    


    const ClientErrorNameInvalid_possibleTypes: string[] = ['ClientErrorNameInvalid']
    export const isClientErrorNameInvalid = (obj?: { __typename?: any } | null): obj is ClientErrorNameInvalid => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientErrorNameInvalid"')
      return ClientErrorNameInvalid_possibleTypes.includes(obj.__typename)
    }
    


    const ClientErrorWithoutInterface_possibleTypes: string[] = ['ClientErrorWithoutInterface']
    export const isClientErrorWithoutInterface = (obj?: { __typename?: any } | null): obj is ClientErrorWithoutInterface => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isClientErrorWithoutInterface"')
      return ClientErrorWithoutInterface_possibleTypes.includes(obj.__typename)
    }
    


    const GenericError_possibleTypes: string[] = ['ClientErrorNameAlreadyTaken','ClientErrorNameInvalid','ClientErrorWithoutInterface']
    export const isGenericError = (obj?: { __typename?: any } | null): obj is GenericError => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGenericError"')
      return GenericError_possibleTypes.includes(obj.__typename)
    }
    


    const InterfaceNotImplemented_possibleTypes: string[] = []
    export const isInterfaceNotImplemented = (obj?: { __typename?: any } | null): obj is InterfaceNotImplemented => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInterfaceNotImplemented"')
      return InterfaceNotImplemented_possibleTypes.includes(obj.__typename)
    }
    

export const enumSomeEnum = {
   X: 'X' as const,
   Y: 'Y' as const,
   Z: 'Z' as const
}

export const enumSomeEnum2 = {
   hello: 'hello' as const,
   world: 'world' as const
}
