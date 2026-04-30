import { styled } from '@linaria/atomic';

import { Postmortem } from '../types/incidents.types';

type PostmortemViewProps = {
  postmortem: Postmortem;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
`;

const SectionContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
`;

const LessonItem = styled.li`
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
`;

const ActionItemCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

const ActionItemText = styled.span<{ completed: boolean }>`
  font-size: 13px;
  text-decoration: ${(props) => (props.completed ? 'line-through' : 'none')};
  color: ${(props) => (props.completed ? '#9ca3af' : '#1f2937')};
`;

const ActionItemMeta = styled.span`
  font-size: 11px;
  color: #6b7280;
`;

const CompletedBadge = styled.span<{ completed: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => (props.completed ? '#22c55e' : '#f59e0b')};
`;

const PublishedBanner = styled.div`
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 12px;
  color: #166534;
`;

export const PostmortemView = ({ postmortem }: PostmortemViewProps) => {
  const completedCount = postmortem.actionItems.filter(
    (item) => item.completed,
  ).length;

  return (
    <Container>
      {postmortem.publishedAt !== null && (
        <PublishedBanner>
          Published on{' '}
          {new Date(postmortem.publishedAt).toLocaleDateString()}
        </PublishedBanner>
      )}

      <Section>
        <SectionTitle>Summary</SectionTitle>
        <SectionContent>{postmortem.summary}</SectionContent>
      </Section>

      <Section>
        <SectionTitle>Root Cause</SectionTitle>
        <SectionContent>{postmortem.rootCause}</SectionContent>
      </Section>

      <Section>
        <SectionTitle>Impact</SectionTitle>
        <SectionContent>{postmortem.impact}</SectionContent>
      </Section>

      <Section>
        <SectionTitle>Timeline</SectionTitle>
        <SectionContent>{postmortem.timeline}</SectionContent>
      </Section>

      <Section>
        <SectionTitle>Lessons Learned</SectionTitle>
        <ul>
          {postmortem.lessonsLearned.map((lesson, index) => (
            <LessonItem key={index}>{lesson}</LessonItem>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionTitle>
          Action Items ({completedCount}/{postmortem.actionItems.length})
        </SectionTitle>
        {postmortem.actionItems.map((item) => (
          <ActionItemCard key={item.id}>
            <div>
              <ActionItemText completed={item.completed}>
                {item.description}
              </ActionItemText>
              <br />
              <ActionItemMeta>
                {item.assigneeName} | Due:{' '}
                {new Date(item.dueDate).toLocaleDateString()}
              </ActionItemMeta>
            </div>
            <CompletedBadge completed={item.completed}>
              {item.completed ? 'Done' : 'Pending'}
            </CompletedBadge>
          </ActionItemCard>
        ))}
      </Section>
    </Container>
  );
};
