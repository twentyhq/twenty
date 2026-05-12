import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { styled } from '@linaria/react';
import { lazy, Suspense, useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { isUndefined } from '@sniptt/guards';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const RichTextFieldEditor = lazy(() =>
  import(
    '@/object-record/record-field/ui/meta-types/input/components/RichTextFieldEditor'
  ).then((module) => ({
    default: module.RichTextFieldEditor,
  })),
);

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledEditorContainer = styled.div`
  box-sizing: border-box;
  padding-inline: 44px;
  width: 100%;
`;

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const LoadingSkeleton = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledSkeletonContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={theme.border.radius.sm}
      >
        <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
      </SkeletonTheme>
    </StyledSkeletonContainer>
  );
};

type FieldWidgetRichTextEditorProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
};

export const FieldWidgetRichTextEditor = ({
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
}: FieldWidgetRichTextEditorProps) => {
  const objectNameSingular = objectMetadataItem.nameSingular;
  const fieldName = fieldMetadataItem.name;

  const fieldValue = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId,
    fieldName,
  });

  if (isUndefined(fieldValue)) {
    return <LoadingSkeleton />;
  }

  return (
    <StyledContainer>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-field-widget-rich-text-${recordId}-${fieldName}`}
      >
        <StyledEditorContainer>
          <Suspense fallback={<LoadingSkeleton />}>
            <RichTextFieldEditor
              recordId={recordId}
              objectNameSingular={objectNameSingular}
              fieldName={fieldName}
            />
          </Suspense>
        </StyledEditorContainer>
      </ScrollWrapper>
    </StyledContainer>
  );
};
