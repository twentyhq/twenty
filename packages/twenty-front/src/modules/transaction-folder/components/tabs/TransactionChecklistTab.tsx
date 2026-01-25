import styled from '@emotion/styled';
import { useState } from 'react';
import {
    IconCheck,
    IconChevronDown,
    IconChevronRight,
    IconFile,
    IconSignature,
    IconUpload
} from 'twenty-ui/display';

const StyledChecklistContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const StyledProgressSummary = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledProgressBar = styled.div`
  width: 200px;
  height: 8px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  overflow: hidden;
`;

const StyledProgressFill = styled.div<{ progress: number }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  transition: width 0.3s ease;
`;

const StyledProgressText = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
`;

const StyledSectionHeader = styled.div<{ isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.secondary};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledSectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionName = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledSectionProgress = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSectionContent = styled.div<{ isExpanded: boolean }>`
  display: ${({ isExpanded }) => (isExpanded ? 'block' : 'none')};
`;

const StyledChecklistItem = styled.div<{ isCompleted: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  background: ${({ theme, isCompleted }) =>
    isCompleted ? theme.background.secondary : theme.background.primary};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledCheckbox = styled.div<{ isChecked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 2px solid
    ${({ theme, isChecked }) =>
      isChecked ? theme.color.green : theme.border.color.medium};
  background: ${({ theme, isChecked }) =>
    isChecked ? theme.color.green : 'transparent'};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme, isChecked }) =>
      isChecked ? theme.color.green50 : theme.color.blue};
  }
`;

const StyledItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledItemTitle = styled.span<{ isCompleted: boolean }>`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme, isCompleted }) =>
    isCompleted ? theme.font.color.tertiary : theme.font.color.primary};
  text-decoration: ${({ isCompleted }) =>
    isCompleted ? 'line-through' : 'none'};
`;

const StyledItemBadges = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledBadge = styled.span<{ type: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1.5)}`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  font-size: ${({ theme }) => theme.font.size.xs};
  background: ${({ theme, type }) => {
    switch (type) {
      case 'required':
        return theme.color.red10;
      case 'document':
        return theme.color.blue10;
      case 'signature':
        return theme.color.purple10;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, type }) => {
    switch (type) {
      case 'required':
        return theme.color.red;
      case 'document':
        return theme.color.blue;
      case 'signature':
        return theme.color.purple;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

const StyledItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDueDate = styled.span<{ isOverdue: boolean }>`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme, isOverdue }) =>
    isOverdue ? theme.color.red : theme.font.color.tertiary};
`;

const StyledActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme }) => theme.background.primary};
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

type TransactionChecklistTabProps = {
  transactionId: string;
};

export const TransactionChecklistTab = ({
  transactionId,
}: TransactionChecklistTabProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'contract',
    'inspection',
  ]);

  // Mock data - would come from Checklist/ChecklistItem entities
  const checklistSections = [
    {
      id: 'contract',
      name: 'Contract Phase',
      items: [
        {
          id: '1',
          title: 'Contract Executed (TREC 1-4)',
          isCompleted: true,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          dueDate: '2024-01-15',
          documentStatus: 'uploaded',
        },
        {
          id: '2',
          title: "Seller's Disclosure Received",
          isCompleted: true,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-01-15',
          documentStatus: 'uploaded',
        },
        {
          id: '3',
          title: 'Third Party Financing Addendum',
          isCompleted: true,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          dueDate: '2024-01-15',
          documentStatus: 'uploaded',
        },
        {
          id: '4',
          title: 'Earnest Money Deposited',
          isCompleted: true,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-01-18',
          documentStatus: 'uploaded',
        },
        {
          id: '5',
          title: 'Option Fee Paid',
          isCompleted: true,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-01-16',
          documentStatus: 'uploaded',
        },
      ],
    },
    {
      id: 'inspection',
      name: 'Option/Inspection Period',
      items: [
        {
          id: '6',
          title: 'Home Inspection Scheduled',
          isCompleted: true,
          isRequired: true,
          requiresDocument: false,
          requiresSignature: false,
          dueDate: '2024-01-17',
          documentStatus: null,
        },
        {
          id: '7',
          title: 'Home Inspection Completed',
          isCompleted: true,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-01-20',
          documentStatus: 'uploaded',
        },
        {
          id: '8',
          title: 'Amendment for Repairs',
          isCompleted: false,
          isRequired: false,
          requiresDocument: true,
          requiresSignature: true,
          dueDate: '2024-01-22',
          documentStatus: 'pending',
        },
        {
          id: '9',
          title: 'Option Period Expires',
          isCompleted: true,
          isRequired: true,
          requiresDocument: false,
          requiresSignature: false,
          dueDate: '2024-01-22',
          documentStatus: null,
        },
      ],
    },
    {
      id: 'financing',
      name: 'Financing',
      items: [
        {
          id: '10',
          title: 'Loan Application Submitted',
          isCompleted: true,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-01-18',
          documentStatus: 'uploaded',
        },
        {
          id: '11',
          title: 'Appraisal Ordered',
          isCompleted: true,
          isRequired: true,
          requiresDocument: false,
          requiresSignature: false,
          dueDate: '2024-01-20',
          documentStatus: null,
        },
        {
          id: '12',
          title: 'Appraisal Completed',
          isCompleted: false,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-01-29',
          documentStatus: null,
        },
        {
          id: '13',
          title: 'Loan Approval Received',
          isCompleted: false,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-02-05',
          documentStatus: null,
        },
        {
          id: '14',
          title: 'Clear to Close',
          isCompleted: false,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-02-10',
          documentStatus: null,
        },
      ],
    },
    {
      id: 'title',
      name: 'Title & Survey',
      items: [
        {
          id: '15',
          title: 'Title Commitment Received',
          isCompleted: false,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-01-25',
          documentStatus: null,
        },
        {
          id: '16',
          title: 'Survey Received',
          isCompleted: false,
          isRequired: false,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-02-01',
          documentStatus: null,
        },
      ],
    },
    {
      id: 'closing',
      name: 'Closing',
      items: [
        {
          id: '17',
          title: 'Closing Disclosure Received',
          isCompleted: false,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: false,
          dueDate: '2024-02-12',
          documentStatus: null,
        },
        {
          id: '18',
          title: 'Final Walkthrough Completed',
          isCompleted: false,
          isRequired: true,
          requiresDocument: false,
          requiresSignature: false,
          dueDate: '2024-02-14',
          documentStatus: null,
        },
        {
          id: '19',
          title: 'Closing Documents Signed',
          isCompleted: false,
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          dueDate: '2024-02-15',
          documentStatus: null,
        },
      ],
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const totalItems = checklistSections.reduce(
    (acc, section) => acc + section.items.length,
    0,
  );
  const completedItems = checklistSections.reduce(
    (acc, section) =>
      acc + section.items.filter((item) => item.isCompleted).length,
    0,
  );
  const overallProgress = Math.round((completedItems / totalItems) * 100);

  const isOverdue = (dateStr: string, isCompleted: boolean) => {
    if (isCompleted) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <StyledChecklistContainer>
      <StyledHeader>
        <StyledTitle>Transaction Checklist</StyledTitle>
        <StyledProgressSummary>
          <StyledProgressBar>
            <StyledProgressFill progress={overallProgress} />
          </StyledProgressBar>
          <StyledProgressText>
            {completedItems}/{totalItems} items ({overallProgress}%)
          </StyledProgressText>
        </StyledProgressSummary>
      </StyledHeader>

      {checklistSections.map((section) => {
        const sectionCompleted = section.items.filter(
          (item) => item.isCompleted,
        ).length;
        const sectionTotal = section.items.length;
        const isExpanded = expandedSections.includes(section.id);

        return (
          <StyledSection key={section.id}>
            <StyledSectionHeader
              isExpanded={isExpanded}
              onClick={() => toggleSection(section.id)}
            >
              <StyledSectionTitle>
                {isExpanded ? (
                  <IconChevronDown size={16} />
                ) : (
                  <IconChevronRight size={16} />
                )}
                <StyledSectionName>{section.name}</StyledSectionName>
              </StyledSectionTitle>
              <StyledSectionProgress>
                {sectionCompleted}/{sectionTotal} complete
              </StyledSectionProgress>
            </StyledSectionHeader>

            <StyledSectionContent isExpanded={isExpanded}>
              {section.items.map((item) => (
                <StyledChecklistItem
                  key={item.id}
                  isCompleted={item.isCompleted}
                >
                  <StyledItemLeft>
                    <StyledCheckbox isChecked={item.isCompleted}>
                      {item.isCompleted && <IconCheck size={14} />}
                    </StyledCheckbox>
                    <StyledItemContent>
                      <StyledItemTitle isCompleted={item.isCompleted}>
                        {item.title}
                      </StyledItemTitle>
                      <StyledItemBadges>
                        {item.isRequired && (
                          <StyledBadge type="required">Required</StyledBadge>
                        )}
                        {item.requiresDocument && (
                          <StyledBadge type="document">
                            <IconFile size={10} />
                            Document
                          </StyledBadge>
                        )}
                        {item.requiresSignature && (
                          <StyledBadge type="signature">
                            <IconSignature size={10} />
                            Signature
                          </StyledBadge>
                        )}
                      </StyledItemBadges>
                    </StyledItemContent>
                  </StyledItemLeft>
                  <StyledItemRight>
                    <StyledDueDate
                      isOverdue={isOverdue(item.dueDate, item.isCompleted)}
                    >
                      Due{' '}
                      {new Date(item.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </StyledDueDate>
                    {item.requiresDocument && !item.isCompleted && (
                      <StyledActionButton>
                        <IconUpload size={12} />
                        Upload
                      </StyledActionButton>
                    )}
                    {item.requiresSignature && !item.isCompleted && (
                      <StyledActionButton>
                        <IconSignature size={12} />
                        Send for Signature
                      </StyledActionButton>
                    )}
                  </StyledItemRight>
                </StyledChecklistItem>
              ))}
            </StyledSectionContent>
          </StyledSection>
        );
      })}
    </StyledChecklistContainer>
  );
};
