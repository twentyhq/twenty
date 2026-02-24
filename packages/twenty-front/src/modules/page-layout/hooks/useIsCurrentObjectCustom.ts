import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

export const useIsCurrentObjectCustom = () => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const objectMetadataItem = useFamilySelectorValue(
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
