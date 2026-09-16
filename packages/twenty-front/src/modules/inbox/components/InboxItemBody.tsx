import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemContextSlot } from '@/inbox/components/InboxItemContextSlot';
import { InboxItemFeaturedSlot } from '@/inbox/components/InboxItemFeaturedSlot';
import { InboxItemPlanSlot } from '@/inbox/components/InboxItemPlanSlot';
import { useInboxItemPlanContext } from '@/inbox/hooks/useInboxItemPlanContext';
import { getInboxPreviewSubject } from '@/inbox/subject-previews/utils/getInboxPreviewSubject';
import { getInboxSubjectPreview } from '@/inbox/subject-previews/utils/getInboxSubjectPreview';
import { getInboxToolCallRenderer } from '@/inbox/tool-call-renderers/utils/getInboxToolCallRenderer';
import { getInboxToolCallStarters } from '@/inbox/tool-call-renderers/utils/getInboxToolCallStarters';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledScroll = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSummary = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  margin: 0;
`;

// One card around what the item is about and the call that takes the body,
// so a reply reads as attached to its thread without the preview owning the
// composer. The slots render content; the card and the divider are drawn here.
const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.light};
  }
`;

// The only thing in the pane that scrolls. What the item is about comes
// first, then the call that takes the body, then the rest of the plan. Which
// preview and which starters apply are registry lookups on the subject's
// object, so a new kind of subject is an entry, not a branch here.
export const InboxItemBody = () => {
  const { inboxItem, isArchived, featuredToolCall } = useInboxItemPlanContext();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const previewSubject = getInboxPreviewSubject({
    inboxItem,
    getObjectNameSingular: (objectMetadataId) =>
      objectMetadataItemsByIdMap.get(objectMetadataId)?.nameSingular,
    hasPreview: (objectNameSingular) =>
      isDefined(getInboxSubjectPreview(objectNameSingular)),
  });
  const Preview = isDefined(previewSubject)
    ? getInboxSubjectPreview(previewSubject.objectNameSingular)?.Preview
    : undefined;
  // A starter adds a step by hand, which only makes sense while nothing is
  // already taking the body and the item is still open.
  const starters =
    isDefined(previewSubject) && !isArchived && !isDefined(featuredToolCall)
      ? getInboxToolCallStarters(previewSubject.objectNameSingular)
      : [];

  const hasSubjectSection =
    isDefined(previewSubject) ||
    isDefined(inboxItem.threadId) ||
    inboxItem.records.length > 0 ||
    starters.length > 0;
  const hasFeaturedSection =
    isDefined(featuredToolCall) &&
    isDefined(getInboxToolCallRenderer(featuredToolCall.toolName)?.Surface);

  return (
    <StyledScroll>
      {isNonEmptyString(inboxItem.summary) && (
        <StyledSummary>{inboxItem.summary}</StyledSummary>
      )}
      {(hasSubjectSection || hasFeaturedSection) && (
        <StyledCard>
          {hasSubjectSection && (
            <StyledSection>
              <InboxItemContextSlot
                previewSubject={previewSubject}
                Preview={Preview}
                starters={starters}
              />
            </StyledSection>
          )}
          {hasFeaturedSection && (
            <StyledSection>
              <InboxItemFeaturedSlot />
            </StyledSection>
          )}
        </StyledCard>
      )}
      <InboxItemPlanSlot />
    </StyledScroll>
  );
};
