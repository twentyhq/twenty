// @ts-nocheck
//////////////////////////////////////////////////

// SOME THINGS TO KNOW BEFORE DIVING IN
/*
0. DST is the request type, SRC is the response type

1. FieldsSelection uses an object because currently is impossible to make recursive types

2. FieldsSelection is a recursive type that makes a type based on request type and fields

3. HandleObject handles object types

4. Handle__scalar adds all scalar properties excluding non scalar props
*/

export type FieldsSelection<SRC extends Anify<DST> | undefined, DST> = {
    scalar: SRC
    union: Handle__isUnion<SRC, DST>
    object: HandleObject<SRC, DST>
    array: SRC extends Nil
        ? never
        : SRC extends Array<infer T | null>
        ? Array<FieldsSelection<T, DST>>
        : never
    __scalar: Handle__scalar<SRC, DST>
    never: never
}[DST extends Nil
    ? 'never'
    : DST extends false | 0
    ? 'never'
    : SRC extends Scalar
    ? 'scalar'
    : SRC extends any[]
    ? 'array'
    : SRC extends { __isUnion?: any }
    ? 'union'
    : DST extends { __scalar?: any }
    ? '__scalar'
    : DST extends {}
    ? 'object'
    : 'never']

type HandleObject<SRC extends Anify<DST>, DST> = DST extends boolean
    ? SRC
    : SRC extends Nil
    ? never
    : Pick<
          {
              // using keyof SRC to maintain ?: relations of SRC type
              [Key in keyof SRC]: Key extends keyof DST
                  ? FieldsSelection<SRC[Key], NonNullable<DST[Key]>>
                  : SRC[Key]
          },
          Exclude<keyof DST, FieldsToRemove>
          //   {
          //       // remove falsy values
          //       [Key in keyof DST]: DST[Key] extends false | 0 ? never : Key
          //   }[keyof DST]
      >

type Handle__scalar<SRC extends Anify<DST>, DST> = SRC extends Nil
    ? never
    : Pick<
          // continue processing fields that are in DST, directly pass SRC type if not in DST
          {
              [Key in keyof SRC]: Key extends keyof DST
                  ? FieldsSelection<SRC[Key], DST[Key]>
                  : SRC[Key]
          },
          // remove fields that are not scalars or are not in DST
          {
              [Key in keyof SRC]: SRC[Key] extends Nil
                  ? never
                  : Key extends FieldsToRemove
                  ? never
                  : SRC[Key] extends Scalar
                  ? Key
                  : Key extends keyof DST
                  ? Key
                  : never
          }[keyof SRC]
      >

type Handle__isUnion<SRC extends Anify<DST>, DST> = SRC extends Nil
    ? never
    : Omit<SRC, FieldsToRemove> // just return the union type

type Scalar = string | number | Date | boolean | null | undefined

type Anify<T> = { [P in keyof T]?: any }

type FieldsToRemove = '__isUnion' | '__scalar' | '__name' | '__args'

type Nil = undefined | null
