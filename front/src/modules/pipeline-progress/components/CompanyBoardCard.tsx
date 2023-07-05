import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconCurrencyDollar,
  IconProgressCheck,
  IconRecycle,
  IconUserCircle,
} from '@tabler/icons-react';

import { TextInput } from '@/ui/components/inputs/TextInput';

import { Company, PipelineProgress } from '../../../generated/graphql';
import { PersonChip } from '../../people/components/PersonChip';
import { Checkbox } from '../../ui/components/form/Checkbox';
import { IconCalendarEvent, IconUsers } from '../../ui/icons';
import { getLogoUrlFromDomainName, humanReadableDate } from '../../utils/utils';

const StyledBoardCard = styled.div<{ selected: boolean }>`
  background-color: ${({ theme, selected }) =>
    selected ? theme.selectedCard : theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  color: ${({ theme }) => theme.font.color.primary};
  &:hover {
    background-color: ${({ theme, selected }) =>
      selected ? theme.selectedCardHover : theme.background.tertiary};
  }
  cursor: pointer;
`;

const StyledBoardCardWrapper = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledBoardCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: 24px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  img {
    height: ${({ theme }) => theme.icon.size.md}px;
    margin-right: ${({ theme }) => theme.spacing(2)};
    object-fit: cover;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;
const StyledBoardCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  span {
    align-items: center;
    display: flex;
    flex-direction: row;
    svg {
      color: ${({ theme }) => theme.font.color.tertiary};
      margin-right: ${({ theme }) => theme.spacing(2)};
    }
  }
`;

type CompanyProp = Pick<
  Company,
  'id' | 'name' | 'domainName' | 'employees' | 'accountOwner'
>;

type PipelineProgressProp = Pick<PipelineProgress, 'id' | 'amount'>;

export function CompanyBoardCard({
  company,
  pipelineProgress,
  selected,
  onSelect,
  onUpdateCard,
}: {
  company: CompanyProp;
  pipelineProgress: PipelineProgressProp;
  selected: boolean;
  onSelect: (company: CompanyProp) => void;
  onUpdateCard: (pipelineProgress: PipelineProgressProp) => Promise<void>;
}) {
  const theme = useTheme();
  return (
    <StyledBoardCardWrapper>
      <StyledBoardCard selected={selected}>
        <StyledBoardCardHeader>
          <img
            src={getLogoUrlFromDomainName(company.domainName).toString()}
            alt={`${company.name}-company-logo`}
          />
          <span>{company.name}</span>
          <div style={{ display: 'flex', flex: 1 }} />
          <Checkbox checked={selected} onChange={() => onSelect(company)} />
        </StyledBoardCardHeader>
        <StyledBoardCardBody>
          <span>
            <IconCurrencyDollar size={theme.icon.size.md} />
            <TextInput
              value={pipelineProgress.amount?.toString() || '0'}
              placeholder="Amount"
              onChange={(value) =>
                onUpdateCard({
                  id: pipelineProgress.id,
                  amount: parseInt(value),
                })
              }
              fullWidth
            />
          </span>
          <span>
            <IconCalendarEvent size={theme.icon.size.md} />
            {humanReadableDate(new Date())}
          </span>
          <span>
            <IconUserCircle size={theme.icon.size.md} />
            <PersonChip name={company.accountOwner?.displayName || ''} />
          </span>
          <span>
            <IconProgressCheck size={theme.icon.size.md} />
            Likely
          </span>
          <span>
            <IconRecycle size={theme.icon.size.md} />
            One-time
          </span>
          <span>
            <IconUsers size={theme.icon.size.md} /> {company.employees}
            <PersonChip name={company.accountOwner?.displayName || ''} />
            <PersonChip name={company.accountOwner?.displayName || ''} />
          </span>
        </StyledBoardCardBody>
      </StyledBoardCard>
    </StyledBoardCardWrapper>
  );
}
