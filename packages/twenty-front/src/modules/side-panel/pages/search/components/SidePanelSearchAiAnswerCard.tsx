import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { useOpenAskAiPageWithPreprompt } from '@/ai-chat/composer/hooks/useOpenAskAiPageWithPreprompt';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useOpenSidePanelSearchRecord } from '@/side-panel/pages/search/hooks/useOpenSidePanelSearchRecord';
import { type SidePanelSearchAiAnswerState } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerState';
import { sendSidePanelSearchAskAiHandoff } from '@/side-panel/pages/search/utils/sendSidePanelSearchAskAiHandoff';
import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconMessageCirclePlus, IconSparkles } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSources = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledActions = styled.div`
  display: flex;
`;

const StyledQuickAnswerRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

type SidePanelSearchAiAnswerCardProps = {
  question: string;
  answerState: Exclude<SidePanelSearchAiAnswerState, { status: 'idle' }>;
  searchSessionId: string;
  onRequestQuickAnswer: () => void;
};

export const SidePanelSearchAiAnswerCard = ({
  question,
  answerState,
  searchSessionId,
  onRequestQuickAnswer,
}: SidePanelSearchAiAnswerCardProps) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { getIcon } = useIcons();
  const { openSidePanelSearchRecord } = useOpenSidePanelSearchRecord();
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();

  const handleAskInNewChat = () => {
    sendSidePanelSearchAskAiHandoff({ searchSessionId, answerState });

    void openAskAiPageWithPreprompt({
      serializedDocument:
        serializePlainTextAsAdvancedTextEditorDocument(question),
      mode: 'PREFILL',
    });
  };

  const askInNewChatButton = (
    <Button
      size="sm"
      startIcon={<IconMessageCirclePlus />}
      onClick={handleAskInNewChat}
    >
      {t`Ask in a new chat`}
    </Button>
  );

  if (answerState.status === 'quickAnswerAvailable') {
    return (
      <StyledQuickAnswerRow>
        <Button
          size="sm"
          startIcon={<IconSparkles />}
          onClick={onRequestQuickAnswer}
        >
          {t`Get a quick answer`}
        </Button>
        {askInNewChatButton}
        {answerState.reason === 'automaticLimitReached' && (
          <Text size="sm" color="tertiary">
            {t`Automatic answers are paused for now.`}
          </Text>
        )}
      </StyledQuickAnswerRow>
    );
  }

  const renderBody = () => {
    if (answerState.status === 'loading') {
      return (
        <StyledSkeleton aria-label={t`Generating an answer`} role="status">
          <Skeleton width="100%" height={themeCssVariables.spacing[3]} />
          <Skeleton width="60%" height={themeCssVariables.spacing[3]} />
        </StyledSkeleton>
      );
    }

    if (answerState.status === 'failed') {
      return (
        <Text color="tertiary">{t`AI answers are not available right now.`}</Text>
      );
    }

    if (answerState.answer.kind === 'handoff') {
      return (
        <Text color="tertiary">{t`Ask AI can explore more records to answer this.`}</Text>
      );
    }

    return (
      <>
        <Text color="primary">{answerState.answer.text}</Text>
        <StyledSources>
          {answerState.answer.sources.map((source) => {
            const objectMetadataItem = objectMetadataItems.find(
              (item) => item.nameSingular === source.objectNameSingular,
            );
            const Icon = getIcon(objectMetadataItem?.icon);

            return (
              <LinkChip
                key={`${source.objectNameSingular}:${source.recordId}`}
                to={getAppPath(AppPath.RecordShowPage, {
                  objectNameSingular: source.objectNameSingular,
                  objectRecordId: source.recordId,
                })}
                triggerEvent="CLICK"
                onClick={() => openSidePanelSearchRecord(source)}
                startElement={isDefined(Icon) ? <Icon size={14} /> : undefined}
              >
                {getChipLabel(source.displayName).content}
              </LinkChip>
            );
          })}
        </StyledSources>
      </>
    );
  };

  return (
    <Card.Root fullWidth>
      <StyledContent aria-live="polite">
        <StyledHeader>
          <IconSparkles size={14} />
          <Text size="sm" color="tertiary">{t`AI answer`}</Text>
        </StyledHeader>
        {renderBody()}
        <StyledActions>{askInNewChatButton}</StyledActions>
      </StyledContent>
    </Card.Root>
  );
};
