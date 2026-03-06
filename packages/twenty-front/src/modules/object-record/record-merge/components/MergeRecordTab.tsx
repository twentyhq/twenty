import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { CardType } from '@/object-record/record-show/types/CardType';
import { getCardComponent } from '@/object-record/record-show/utils/getCardComponent';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { Section } from 'twenty-ui/layout';
import { PageLayoutType } from '~/generated-metadata/graphql';

type MergeRecordTabProps = {
  isInSidePanel?: boolean;
  objectNameSingular: string;
  recordId: string;
};

export const MergeRecordTab = ({
  objectNameSingular,
  recordId,
}: MergeRecordTabProps) => {
  return (
    <LayoutRenderingProvider
      value={{
        targetRecordIdentifier: {
          id: recordId,
          targetObjectNameSingular: objectNameSingular,
        },
        layoutType: PageLayoutType.RECORD_PAGE,
        isInSidePanel: true,
      }}
    >
      <Section>
        <SummaryCard
          objectNameSingular={objectNameSingular}
          objectRecordId={recordId}
          isInSidePanel={true}
        />

        {getCardComponent(CardType.FieldCard, {
          showDuplicatesSection: false,
        })}
      </Section>
    </LayoutRenderingProvider>
  );
};
