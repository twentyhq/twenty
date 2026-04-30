import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { Department, EmployeeData } from '../types/hrm.types';

const MOCK_EMPLOYEES: EmployeeData[] = [
  { id: 'E1', name: 'Ana Torres', email: 'ana@company.co', department: 'engineering', title: 'Lead Engineer', status: 'active', hireDate: '2023-03-15' },
  { id: 'E2', name: 'Carlos Mendez', email: 'carlos@company.co', department: 'sales', title: 'Sales Manager', status: 'active', hireDate: '2022-07-01' },
  { id: 'E3', name: 'Maria Lopez', email: 'maria@company.co', department: 'hr', title: 'HR Director', status: 'active', hireDate: '2021-01-10' },
  { id: 'E4', name: 'Pedro Ruiz', email: 'pedro@company.co', department: 'engineering', title: 'Backend Developer', status: 'on_leave', hireDate: '2024-06-20' },
  { id: 'E5', name: 'Sofia Garcia', email: 'sofia@company.co', department: 'marketing', title: 'Content Lead', status: 'active', hireDate: '2023-11-05' },
  { id: 'E6', name: 'Luis Reyes', email: 'luis@company.co', department: 'finance', title: 'Accountant', status: 'active', hireDate: '2024-02-14' },
];

const ALL_DEPARTMENTS: Department[] = ['engineering', 'sales', 'marketing', 'hr', 'finance', 'operations'];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledFilter = styled.select`
  padding: ${themeCssVariables.spacing[2]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.transparent.lighter};
  align-self: flex-start;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBadge = styled.span<{ isActive: boolean }>`
  font-size: ${themeCssVariables.font.size.xs};
  padding: 2px 6px;
  border-radius: 4px;
  align-self: flex-start;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.color.turquoise : themeCssVariables.color.orange};
  color: ${themeCssVariables.font.color.inverted};
`;

export const EmployeeDirectory = () => {
  useLingui();
  const [filter, setFilter] = useState<Department | 'all'>('all');

  const filtered = filter === 'all'
    ? MOCK_EMPLOYEES
    : MOCK_EMPLOYEES.filter((e) => e.department === filter);

  return (
    <StyledContainer>
      <StyledTitle>{t`Employee Directory`}</StyledTitle>
      <StyledFilter value={filter} onChange={(e) => setFilter(e.target.value as Department | 'all')}>
        <option value="all">{t`All Departments`}</option>
        {ALL_DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </StyledFilter>
      <StyledGrid>
        {filtered.map((employee) => (
          <StyledCard key={employee.id}>
            <StyledName>{employee.name}</StyledName>
            <StyledDetail>{employee.title}</StyledDetail>
            <StyledDetail>{employee.department}</StyledDetail>
            <StyledDetail>{employee.email}</StyledDetail>
            <StyledBadge isActive={employee.status === 'active'}>
              {employee.status.replace('_', ' ')}
            </StyledBadge>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
