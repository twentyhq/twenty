import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type TipTapRichTextColumnTarget = {
  objectMetadataUniversalIdentifier: string;
  blocknoteColumnName: string;
  markdownColumnName: string;
};

type BuildTipTapRichTextColumnTargetsArgs = {
  flatObjectMetadatas: {
    universalIdentifier: string;
    isRemote: boolean;
    fieldUniversalIdentifiers: string[];
  }[];
  flatFieldMetadataByUniversalIdentifier: Partial<
    Record<string, { type: FieldMetadataType; name: string } | undefined>
  >;
  computeColumnName: (fieldName: string, subFieldName: string) => string;
};

export const buildTipTapRichTextColumnTargets = ({
  flatObjectMetadatas,
  flatFieldMetadataByUniversalIdentifier,
  computeColumnName,
}: BuildTipTapRichTextColumnTargetsArgs): TipTapRichTextColumnTarget[] =>
  flatObjectMetadatas
    .filter((flatObjectMetadata) => !flatObjectMetadata.isRemote)
    .flatMap((flatObjectMetadata) =>
      flatObjectMetadata.fieldUniversalIdentifiers
        .map(
          (fieldMetadataUniversalIdentifier) =>
            flatFieldMetadataByUniversalIdentifier[
              fieldMetadataUniversalIdentifier
            ],
        )
        .filter(isDefined)
        .filter(
          (flatFieldMetadata) =>
            flatFieldMetadata.type === FieldMetadataType.RICH_TEXT,
        )
        .map((flatFieldMetadata) => ({
          objectMetadataUniversalIdentifier:
            flatObjectMetadata.universalIdentifier,
          blocknoteColumnName: computeColumnName(
            flatFieldMetadata.name,
            'blocknote',
          ),
          markdownColumnName: computeColumnName(
            flatFieldMetadata.name,
            'markdown',
          ),
        })),
    );
