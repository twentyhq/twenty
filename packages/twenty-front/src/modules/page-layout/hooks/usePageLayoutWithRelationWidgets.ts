import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { injectRelationWidgetsIntoLayout } from '@/page-layout/utils/injectRelationWidgetsIntoLayout';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const usePageLayoutWithRelationWidgets = (
  basePageLayout: PageLayout | undefined,
): PageLayout | undefined => {
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const { boxedRelationFieldMetadataItems } = useFieldListFieldMetadataItems({
    objectNameSingular: targetRecordIdentifier?.targetObjectNameSingular ?? '',
  });

  if (!isDefined(basePageLayout)) {
    return undefined;
  }

  const isRecordPage = layoutType === PageLayoutType.RECORD_PAGE;

  if (!isRecordPage) {
    return basePageLayout;
  }

  return injectRelationWidgetsIntoLayout(
    basePageLayout,
    boxedRelationFieldMetadataItems,
  );
};
