import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useIsCurrentObjectCustom = () => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const objectMetadataItem = useFamilySelectorValueV2(
    objectMetadataItemFamilySelector,
    {
      objectName: targetRecordIdentifier?.targetObjectNameSingular ?? '',
      objectNameType: 'singular',
    },
  );

  if (!isDefined(targetRecordIdentifier)) {
    return { isCustom: true };
  }

  if (!isDefined(objectMetadataItem)) {
    return { isCustom: true };
  }

  return { isCustom: objectMetadataItem.isCustom };
};
