import styled from '@emotion/styled';

import { SettingsAccountsInboxSettingsCardMedia } from '@/settings/accounts/components/SettingsAccountsInboxSettingsCardMedia';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { Radio } from '@/ui/input/components/Radio';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { Section } from '@/ui/layout/section/components/Section';

export enum InboxSettingsVisibilityValue {
  Everything = 'share_everything',
  SubjectMetadata = 'subject',
  Metadata = 'metadata',
}

type SettingsAccountsInboxSettingsVisibilitySectionProps = {
  onChange: (nextValue: InboxSettingsVisibilityValue) => void;
  value?: InboxSettingsVisibilityValue;
};

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledCardMedia = styled(SettingsAccountsInboxSettingsCardMedia)`
  align-items: stretch;
`;

const StyledSubjectSkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.accent.accent4060 : theme.background.quaternary};
  border-radius: 1px;
  height: 3px;
`;

const StyledMetadataSkeleton = styled(StyledSubjectSkeleton)`
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledBodySkeleton = styled(StyledSubjectSkeleton)`
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: 22px;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledRadio = styled(Radio)`
  margin-left: auto;
`;



export const SettingsAccountsInboxSettingsVisibilitySection = ({
  onChange,
  value = InboxSettingsVisibilityValue.Everything,
}: SettingsAccountsInboxSettingsVisibilitySectionProps) => {
  const { translate } = useI18n('translations');

  const inboxSettingsVisibilityOptions = [
    {
      title: translate('everything'),
      description: translate('everythingDsc'),
      value: InboxSettingsVisibilityValue.Everything,
      visibleElements: {
        metadata: true,
        subject: true,
        body: true,
      },
    },
    {
      title: translate('subjectAndMetadata'),
      description: translate('subjectAndMetadataDsc'),
      value: InboxSettingsVisibilityValue.SubjectMetadata,
      visibleElements: {
        metadata: true,
        subject: true,
        body: false,
      },
    },
    {
      title: translate('metadata'),
      description: translate('metadataDsc'),
      value: InboxSettingsVisibilityValue.Metadata,
      visibleElements: {
        metadata: true,
        subject: false,
        body: false,
      },
    },
  ];

  return (
    <Section>
    <H2Title
      title={translate('emailVisibility')}
      description={translate('emailVisibilityDsc')}
    />
    <Card>
      {inboxSettingsVisibilityOptions.map(
        (
          { title, description, value: optionValue, visibleElements },
          index,
        ) => (
          <StyledCardContent
            key={optionValue}
            divider={index < inboxSettingsVisibilityOptions.length - 1}
            onClick={() => onChange(optionValue)}
          >
            <StyledCardMedia>
              <StyledMetadataSkeleton isActive={visibleElements.metadata} />
              <StyledSubjectSkeleton isActive={visibleElements.subject} />
              <StyledBodySkeleton isActive={visibleElements.body} />
            </StyledCardMedia>
            <div>
              <StyledTitle>{title}</StyledTitle>
              <StyledDescription>{description}</StyledDescription>
            </div>
            <StyledRadio
              value={optionValue}
              onCheckedChange={() => onChange(optionValue)}
              checked={value === optionValue}
            />
          </StyledCardContent>
        ),
      )}
    </Card>
  </Section>
);
}
