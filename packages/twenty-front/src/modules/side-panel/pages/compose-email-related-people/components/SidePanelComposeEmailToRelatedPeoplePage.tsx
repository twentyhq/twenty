import { RelatedPersonRelationList } from '@/activities/emails/related-people/components/RelatedPersonRelationList';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  padding: ${themeCssVariables.spacing[2]};
`;

// Composing navigates this same side panel to the composer, so there is
// nothing to close once a relation is picked.
export const SidePanelComposeEmailToRelatedPeoplePage = () => {
  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  return (
    <StyledContainer>
      <RelatedPersonRelationList
        selectableListInstanceId={`side-panel-related-people-${sidePanelPageInstanceId ?? ''}`}
        contextStoreInstanceId={sidePanelPageInstanceId}
      />
    </StyledContainer>
  );
};
