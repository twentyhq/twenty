// SOURCING: twentyhq/twenty RecordList (PR #23829) — fork-local RELATIONS view
import { RecordRelationsBody } from '@/object-record/record-relations/components/RecordRelationsBody';
import { RecordRelationsComponentInstanceContext } from '@/object-record/record-relations/states/contexts/RecordRelationsComponentInstanceContext';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

export const RecordRelations = () => {
  const recordRelationsId = useAvailableComponentInstanceIdOrThrow(
    RecordRelationsComponentInstanceContext,
  );

  return (
    <StyledContainer>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-record-relations-${recordRelationsId}`}
        defaultEnableXScroll={true}
      >
        <RecordRelationsBody />
      </ScrollWrapper>
    </StyledContainer>
  );
};
