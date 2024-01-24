import styled from '@emotion/styled';

import { SettingsAccountsInboxSettingsCardMedia } from '@/settings/accounts/components/SettingsAccountsInboxSettingsCardMedia';
import { H2Title } from '@/ui/display/typography/components/H2Title';
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

const inboxSettingsVisibilityOptions = [
  {
    title: 'Everything',
    description: 'Subject, body and attachments will be shared with your team.',
    value: InboxSettingsVisibilityValue.Everything,
    visibleElements: {
      metadata: true,
      subject: true,
      body: true,
    },
  },
  {
    title: 'Subject and metadata',
    description: 'Subject and metadata will be shared with your team.',
    value: InboxSettingsVisibilityValue.SubjectMetadata,
    visibleElements: {
      metadata: true,
      subject: true,
      body: false,
    },
  },
  {
    title: 'Metadata',
    description: 'Timestamp and participants will be shared with your team.',
    value: InboxSettingsVisibilityValue.Metadata,
    visibleElements: {
      metadata: true,
      subject: false,
      body: false,
    },
  },
];

export const SettingsAccountsInboxSettingsVisibilitySection = ({
  onChange,
  value = InboxSettingsVisibilityValue.Everything,
}: SettingsAccountsInboxSettingsVisibilitySectionProps) => (
  <Section>
    <H2Title
      title="Email visibility"
      description="Define what will be visible to other users in your workspace"
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
