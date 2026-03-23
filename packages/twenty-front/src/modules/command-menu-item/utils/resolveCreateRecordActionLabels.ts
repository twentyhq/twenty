import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type MessageDescriptor } from '@lingui/core';
import { type Nullable } from 'twenty-shared/types';
import { type ButtonAccent, type ButtonVariant } from 'twenty-ui/input';

export const resolveCreateRecordActionLabels = <
  TAction extends {
    key: string;
    label: Nullable<string | MessageDescriptor>;
    shortLabel?: Nullable<string | MessageDescriptor>;
    accent?: ButtonAccent;
    buttonVariant?: ButtonVariant;
    isPrimaryCTA?: boolean;
  },
>(
  actions: TAction[],
  objectMetadataItem?: Pick<EnrichedObjectMetadataItem, 'labelSingular'>,
): TAction[] => {
  if (!objectMetadataItem) {
    return actions;
  }

  const createRecordLabel = `Create ${objectMetadataItem.labelSingular}`;

  return actions.map((action) => {
    if (action.key !== NoSelectionRecordCommandKeys.CREATE_NEW_RECORD) {
      return action;
    }

    return {
      ...action,
      label: createRecordLabel,
      shortLabel: createRecordLabel,
      accent: 'blue',
      buttonVariant: 'primary',
      isPrimaryCTA: true,
    };
  });
};
