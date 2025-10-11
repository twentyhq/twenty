import { useMergePreview } from '@/object-record/record-merge/hooks/useMergePreview';
import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { CardType } from '@/object-record/record-show/types/CardType';
import { getCardComponent } from '@/object-record/record-show/utils/getCardComponent';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import { PageLayoutType } from '~/generated/graphql';

type MergePreviewTabProps = {
  objectNameSingular: string;
};

export const MergePreviewTab = ({
  objectNameSingular,
}: MergePreviewTabProps) => {
  const { mergePreviewRecord, isGeneratingPreview } = useMergePreview({
    objectNameSingular,
  });

  if (!isDefined(mergePreviewRecord) && !isGeneratingPreview) {
    return null;
  }

  const recordId = mergePreviewRecord?.id ?? 'merge-preview-loading';

  return (
    <LayoutRenderingProvider
      value={{
        targetRecord: {
          id: recordId,
          targetObjectNameSingular: objectNameSingular,
        },
        layoutType: PageLayoutType.RECORD_PAGE,
        isInRightDrawer: true,
      }}
    >
      <Section>
        <SummaryCard
          objectNameSingular={objectNameSingular}
          objectRecordId={recordId}
          isInRightDrawer={true}
        />

        {getCardComponent(CardType.FieldCard, {
          showDuplicatesSection: false,
        })}
      </Section>
    </LayoutRenderingProvider>
  );
};
