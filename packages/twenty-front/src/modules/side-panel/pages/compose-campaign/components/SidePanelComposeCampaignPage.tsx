import { useState } from 'react';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { MAX_CAMPAIGN_RECIPIENTS } from 'twenty-shared/constants';
import { IconSend } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useSendMessageCampaign } from '@/activities/campaigns/hooks/useSendMessageCampaign';
import { useVerifiedEmailingDomains } from '@/activities/campaigns/hooks/useVerifiedEmailingDomains';
import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { composeCampaignDefaultSubjectComponentState } from '@/side-panel/pages/compose-campaign/states/composeCampaignDefaultSubjectComponentState';
import { composeCampaignRecipientFilterComponentState } from '@/side-panel/pages/compose-campaign/states/composeCampaignRecipientFilterComponentState';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledField = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[2]};

  &:focus {
    border-color: ${themeCssVariables.color.blue};
    outline: none;
  }
`;

const StyledBodyEditorWrapper = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-height: 240px;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledSelect = styled.select`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledRecipientCount = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTruncationWarning = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledEmptyDomainsMessage = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const SidePanelComposeCampaignPage = () => {
  const recipientFilter = useAtomComponentStateValue(
    composeCampaignRecipientFilterComponentState,
  );
  const defaultSubject =
    useAtomComponentStateValue(composeCampaignDefaultSubjectComponentState) ??
    '';

  const { goBackFromSidePanel } = useSidePanelHistory();
  const { sendCampaign, loading: sending } = useSendMessageCampaign();
  const { verifiedDomains, loading: domainsLoading } =
    useVerifiedEmailingDomains();

  // Cheap pre-flight count of how many Person rows the filter resolves to.
  // Limit:1 is enough because we only need totalCount from the response; the
  // backend resolves the real recipient list when the mutation fires.
  const { totalCount: matchedRecipientCount, loading: countLoading } =
    useFindManyRecords({
      objectNameSingular: CoreObjectNameSingular.Person,
      filter: recipientFilter ?? undefined,
      recordGqlFields: { id: true },
      limit: 1,
      skip: recipientFilter === null,
    });

  const [name, setName] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  // Rendered HTML — kept in sync with the BlockNote editor via onChange. Sent
  // as the campaign body (the backend forwards it to SES as the HTML body and
  // derives a plain-text fallback for the SES `text` field).
  const [bodyHtml, setBodyHtml] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [emailingDomainId, setEmailingDomainId] = useState(
    verifiedDomains[0]?.id ?? '',
  );

  const editor = useCreateBlockNote({
    schema: BLOCK_SCHEMA,
    domAttributes: { editor: { class: 'editor' } },
    placeholders: { default: t`Write your message…` },
  });

  const handleEditorChange = () => {
    setBodyHtml(editor.blocksToFullHTML(editor.document));
  };

  // Auto-pick the first verified domain when it loads.
  if (!emailingDomainId && verifiedDomains.length > 0) {
    setEmailingDomainId(verifiedDomains[0].id);
  }

  // The BlockNote editor always has at least one empty paragraph block, so an
  // untouched editor produces non-empty HTML. Check the document's text
  // content instead to detect a genuinely empty body.
  const hasBodyContent = editor.document.some((block) => {
    if (!Array.isArray(block.content)) return false;
    return block.content.some(
      (item) =>
        'text' in item &&
        typeof item.text === 'string' &&
        item.text.trim().length > 0,
    );
  });

  const recipientCount = matchedRecipientCount ?? 0;

  const canSend =
    !sending &&
    name.trim().length > 0 &&
    subject.trim().length > 0 &&
    hasBodyContent &&
    fromAddress.trim().length > 0 &&
    emailingDomainId.length > 0 &&
    recipientFilter !== null &&
    recipientCount > 0;

  const handleSend = async () => {
    if (recipientFilter === null) {
      return;
    }

    // Recompute HTML at send time in case onChange was missed during fast typing.
    const finalHtml = editor.blocksToFullHTML(editor.document);

    const success = await sendCampaign({
      name: name.trim(),
      subject: subject.trim(),
      bodyTemplate: finalHtml,
      fromAddress: fromAddress.trim(),
      replyTo: replyTo.trim() ? replyTo.trim() : undefined,
      emailingDomainId,
      recipientFilter,
    });

    if (success) {
      goBackFromSidePanel();
    }
  };

  return (
    <StyledContainer>
      <StyledContent>
        <StyledRecipientCount>
          {countLoading
            ? t`Resolving recipients…`
            : t`Sending to ${recipientCount} recipient(s)`}
        </StyledRecipientCount>

        {recipientCount > MAX_CAMPAIGN_RECIPIENTS && (
          <StyledTruncationWarning>
            {t`Selection matches ${recipientCount} people but the campaign cap is ${MAX_CAMPAIGN_RECIPIENTS}. Only the first ${MAX_CAMPAIGN_RECIPIENTS} will receive this campaign.`}
          </StyledTruncationWarning>
        )}

        {!domainsLoading && verifiedDomains.length === 0 && (
          <StyledEmptyDomainsMessage>
            {t`No verified sending domain. Add one in Settings → Emailing Domains first.`}
          </StyledEmptyDomainsMessage>
        )}

        <StyledField>
          {t`Campaign name`}
          <StyledInput
            type="text"
            placeholder={t`Internal label, e.g. "Q3 Newsletter"`}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </StyledField>

        <StyledField>
          {t`Sending domain`}
          <StyledSelect
            value={emailingDomainId}
            onChange={(event) => setEmailingDomainId(event.target.value)}
            disabled={verifiedDomains.length === 0}
          >
            {verifiedDomains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.domain}
              </option>
            ))}
          </StyledSelect>
        </StyledField>

        <StyledField>
          {t`From`}
          <StyledInput
            type="email"
            placeholder={t`someone@your-verified-domain.com`}
            value={fromAddress}
            onChange={(event) => setFromAddress(event.target.value)}
          />
        </StyledField>

        <StyledField>
          {t`Reply-to (optional)`}
          <StyledInput
            type="email"
            placeholder={t`Replies go to this address`}
            value={replyTo}
            onChange={(event) => setReplyTo(event.target.value)}
          />
        </StyledField>

        <StyledField>
          {t`Subject`}
          <StyledInput
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </StyledField>

        <StyledField>
          {t`Body`}
          <StyledBodyEditorWrapper>
            <BlockEditor editor={editor} onChange={handleEditorChange} />
          </StyledBodyEditorWrapper>
        </StyledField>
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="cancel"
            size="small"
            variant="secondary"
            title={t`Cancel`}
            onClick={goBackFromSidePanel}
          />,
          <Button
            key="send"
            size="small"
            variant="primary"
            accent="blue"
            title={sending ? t`Sending…` : t`Send campaign`}
            Icon={IconSend}
            onClick={handleSend}
            disabled={!canSend}
          />,
        ]}
      />
    </StyledContainer>
  );
};
