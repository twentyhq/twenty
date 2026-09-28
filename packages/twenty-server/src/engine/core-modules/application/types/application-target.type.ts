import { type AllMetadataName } from 'twenty-shared/metadata';

export type ApplicationTargetKind =
  | { kind: 'applicationId' }
  | { kind: 'applicationUniversalIdentifier' }
  | { kind: 'applicationRegistrationId' }
  | {
      kind: 'applicationOwnedEntity';
      metadataName: AllMetadataName;
    };

// Dotted path to a required string field, at most three levels deep, such as
// 'manifest.application.universalIdentifier'
export type StringPathOf<
  TInput,
  TDepth extends unknown[] = [],
> = TDepth['length'] extends 3
  ? never
  : {
      [TKey in keyof TInput & string]-?: TInput[TKey] extends string
        ? TKey
        : TInput[TKey] extends readonly unknown[]
          ? never
          : TInput[TKey] extends object
            ? `${TKey}.${StringPathOf<TInput[TKey], [...TDepth, unknown]>}`
            : never;
    }[keyof TInput & string];

export type ApplicationTarget = ApplicationTargetKind &
  (
    | { source: 'graphqlArg'; argName: string; idKey?: string }
    | { source: 'graphqlArgs'; idKey: string }
    | { source: 'routeParam'; argName: string }
  );
