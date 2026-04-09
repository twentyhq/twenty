import { type EnumFieldMetadataType, type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type FieldMetadataEnumOptions =
  FlatFieldMetadata<EnumFieldMetadataType>['options'];

type Differences<T> = {
  created: T[];
  updated: { from: T; to: T }[];
  deleted: T[];
};
export type CompareToFlatFieldMetadataEnumOptionsArgs = FromTo<
  FieldMetadataEnumOptions,
  'options'
> & {
  compareLabel: boolean;
};
export const compareTwoFlatFieldMetadataEnumOptions = ({
  compareLabel = false,
  fromOptions,
  toOptions,
}: CompareToFlatFieldMetadataEnumOptionsArgs): Differences<
  FieldMetadataEnumOptions[number]
> => {
  const differences: Differences<FieldMetadataEnumOptions[number]> = {
    created: [],
    updated: [],
    deleted: [],
  };

  const fromOptionsMap = new Map(fromOptions.map((opt) => [opt.id, opt]));

  for (const newOption of toOptions) {
    const oldOption = fromOptionsMap.get(newOption.id);

    if (!isDefined(oldOption)) {
      differences.created.push(newOption);
      continue;
    }

    if (
      oldOption.value !== newOption.value ||
      (compareLabel && oldOption.label !== newOption.label)
    ) {
      differences.updated.push({ from: oldOption, to: newOption });
      continue;
    }
  }

  const toOptionsMap = new Map(toOptions.map((opt) => [opt.id, opt]));

  for (const oldOption of fromOptions) {
    if (!toOptionsMap.has(oldOption.id)) {
      differences.deleted.push(oldOption);
    }
  }

  return differences;
};
