import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { useMemo } from 'react';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useWidgetVisibilityFields =
  (): ValidationRuleFieldDescriptor[] => {
    const { targetRecordIdentifier } = useLayoutRenderingContext();
    const { objectMetadataItems } = useObjectMetadataItems();

    const targetObjectNameSingular =
      targetRecordIdentifier?.targetObjectNameSingular;

    return useMemo(() => {
      const targetObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === targetObjectNameSingular,
      );

      return isDefined(targetObjectMetadataItem)
        ? buildValidationRuleFieldDescriptors({
            objectMetadataItem: targetObjectMetadataItem,
            objectMetadataItems,
          })
        : [];
    }, [objectMetadataItems, targetObjectNameSingular]);
  };
