import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { type InboxItemContextSource } from '@/inbox/types/InboxItemContext';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type InboxItem } from '~/generated/graphql';

const StyledChipBadge = styled.span`
  align-items: center;
  align-self: flex-start;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledChipButton = styled.button`
  align-items: center;
  align-self: flex-start;
  background: ${themeCssVariables.background.tertiary};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    background: ${themeCssVariables.background.quaternary};
  }
`;

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SOURCE_ICON_BY_KIND: Record<InboxItemContextSource['kind'], string> = {
  email: 'IconMail',
  thread: 'IconMessageCircle',
  record: 'IconBuildingSkyscraper',
  call: 'IconPhone',
};

type InboxItemSubjectChipProps = {
  inboxItem: Pick<
    InboxItem,
    'threadId' | 'subjectObjectMetadataId' | 'subjectRecordId'
  >;
  source?: InboxItemContextSource;
};

// The page behind the chip opens in the side panel beside the inbox, because
// the item pane itself never embeds another page.
export const InboxItemSubjectChip = ({
  inboxItem,
  source,
}: InboxItemSubjectChipProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const resolveChip = (): {
    Icon: IconComponent;
    label: string;
    onClick?: () => void;
  } | null => {
    const { threadId, subjectObjectMetadataId, subjectRecordId } = inboxItem;

    if (isDefined(threadId)) {
      return {
        Icon: getIcon(SOURCE_ICON_BY_KIND.thread),
        label: source?.kind === 'thread' ? source.label : t`Conversation`,
        onClick: () => {
          switchThreadWithDraft(threadId);
          openAskAiPage();
        },
      };
    }

    const objectMetadataItem = isDefined(subjectObjectMetadataId)
      ? objectMetadataItemsByIdMap.get(subjectObjectMetadataId)
      : undefined;

    if (isDefined(objectMetadataItem) && isDefined(subjectRecordId)) {
      return {
        Icon: getIcon(objectMetadataItem.icon),
        label:
          source?.kind === 'record'
            ? source.label
            : objectMetadataItem.labelSingular,
        onClick: () =>
          openRecordInSidePanel({
            recordId: subjectRecordId,
            objectNameSingular: objectMetadataItem.nameSingular,
          }),
      };
    }

    if (isDefined(source)) {
      return {
        Icon: getIcon(SOURCE_ICON_BY_KIND[source.kind]),
        label: source.label,
      };
    }

    return null;
  };

  const chip = resolveChip();

  if (!isDefined(chip)) {
    return null;
  }

  const { Icon, label, onClick } = chip;
  const content = (
    <>
      <Icon size={theme.icon.size.sm} />
      <StyledLabel>{label}</StyledLabel>
    </>
  );

  // A source with nothing to open behind it is a label, not a control.
  return isDefined(onClick) ? (
    <StyledChipButton type="button" onClick={onClick}>
      {content}
    </StyledChipButton>
  ) : (
    <StyledChipBadge>{content}</StyledChipBadge>
  );
};
