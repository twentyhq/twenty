import { useTemporaryFieldsConfiguration } from '@/page-layout/hooks/useTemporaryFieldsConfiguration';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { useFieldsWidgetFieldMetadataItems } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetFieldMetadataItems';
import { filterAndOrderFieldsFromConfiguration } from '@/page-layout/widgets/fields/utils/filterAndOrderFieldsFromConfiguration';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const useFieldsWidgetSectionsWithFields = (
  objectNameSingular: string,
) => {
  const isMobile = useIsMobile();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const fieldMetadataItems = useFieldsWidgetFieldMetadataItems({
    objectNameSingular,
  });
  const temporaryConfiguration =
    useTemporaryFieldsConfiguration(objectNameSingular);

  const context = buildWidgetVisibilityContext({ isMobile, isInRightDrawer });

  const sectionsWithFields = filterAndOrderFieldsFromConfiguration({
    configuration: temporaryConfiguration ?? {
      __typename: 'FieldsConfiguration',
      configurationType: 'FIELDS',
      sections: [],
    },
    availableFieldMetadataItems: fieldMetadataItems,
    context,
  });

  return { sectionsWithFields };
};
