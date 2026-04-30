import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const StyledSection = styled.div`
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 8px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 ${themeCssVariables.spacing[3]} 0;
`;

const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${themeCssVariables.color.font.secondary};
`;

const StyledInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.color.accent};
  }
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;
`;

const StyledButton = styled.button<{ variant?: string }>`
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${(props) =>
    props.variant === 'danger'
      ? '#ef4444'
      : props.variant === 'secondary'
        ? themeCssVariables.color.border
        : '#3b82f6'};
  color: white;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledStatusDot = styled.span<{ status: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background: ${(props) =>
    props.status === 'connected'
      ? '#10b981'
      : props.status === 'error'
        ? '#ef4444'
        : '#f59e0b'};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    overflow-x: auto;
  }
`;

const StyledTh = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid ${themeCssVariables.color.border};
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: ${themeCssVariables.color.font.secondary};
`;

const StyledTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid ${themeCssVariables.color.border};
`;

const StyledFormRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  align-items: flex-end;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

type Technician = {
  name: string;
  skills: string[];
  availability: string;
  activeOrders: number;
};

type SlaConfig = {
  priority: string;
  responseTime: string;
  resolutionTime: string;
};

type ServiceTemplate = {
  name: string;
  duration: string;
  skillsRequired: string;
};

export const SettingsModuleFSM = () => {
  const { t } = useLingui();

  const [autoAssign, setAutoAssign] = useState('true');
  const [skillMatching, setSkillMatching] = useState('strict');

  const [technicians] = useState<Technician[]>([
    { name: 'Pedro Ramirez', skills: ['Electrical', 'HVAC'], availability: 'Available', activeOrders: 2 },
    { name: 'Ana Garcia', skills: ['Plumbing', 'General'], availability: 'On Job', activeOrders: 1 },
    { name: 'Luis Herrera', skills: ['Electrical', 'Networking'], availability: 'Available', activeOrders: 0 },
    { name: 'Sofia Martinez', skills: ['HVAC', 'Refrigeration'], availability: 'Off Duty', activeOrders: 0 },
  ]);

  const [slaConfigs] = useState<SlaConfig[]>([
    { priority: 'Critical', responseTime: '1 hour', resolutionTime: '4 hours' },
    { priority: 'High', responseTime: '4 hours', resolutionTime: '24 hours' },
    { priority: 'Medium', responseTime: '8 hours', resolutionTime: '48 hours' },
    { priority: 'Low', responseTime: '24 hours', resolutionTime: '5 days' },
  ]);

  const [serviceTemplates] = useState<ServiceTemplate[]>([
    { name: 'HVAC Maintenance', duration: '2 hours', skillsRequired: 'HVAC' },
    { name: 'Electrical Inspection', duration: '1.5 hours', skillsRequired: 'Electrical' },
    { name: 'Network Setup', duration: '3 hours', skillsRequired: 'Networking' },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Field Service`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Field Service` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Field Service Management`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Technician Roster`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Name`}</StyledTh>
                <StyledTh>{t`Skills`}</StyledTh>
                <StyledTh>{t`Availability`}</StyledTh>
                <StyledTh>{t`Active Orders`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {technicians.map((tech) => (
                <tr key={tech.name}>
                  <StyledTd>{tech.name}</StyledTd>
                  <StyledTd>{tech.skills.join(', ')}</StyledTd>
                  <StyledTd>
                    <StyledStatusDot
                      status={
                        tech.availability === 'Available'
                          ? 'connected'
                          : tech.availability === 'On Job'
                            ? 'pending'
                            : 'error'
                      }
                    />
                    {tech.availability}
                  </StyledTd>
                  <StyledTd>{tech.activeOrders}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`SLA Configuration`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Priority`}</StyledTh>
                <StyledTh>{t`Response Time`}</StyledTh>
                <StyledTh>{t`Resolution Time`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {slaConfigs.map((sla) => (
                <tr key={sla.priority}>
                  <StyledTd>{sla.priority}</StyledTd>
                  <StyledTd>{sla.responseTime}</StyledTd>
                  <StyledTd>{sla.resolutionTime}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Dispatch Rules`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Auto-Assign`}</StyledLabel>
              <StyledSelect
                value={autoAssign}
                onChange={(event) => setAutoAssign(event.target.value)}
              >
                <option value="true">{t`Enabled`}</option>
                <option value="false">{t`Disabled`}</option>
              </StyledSelect>
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Skill Matching`}</StyledLabel>
              <StyledSelect
                value={skillMatching}
                onChange={(event) => setSkillMatching(event.target.value)}
              >
                <option value="strict">{t`Strict Match`}</option>
                <option value="partial">{t`Partial Match`}</option>
                <option value="any">{t`Any Available`}</option>
              </StyledSelect>
            </StyledFormGroup>
          </StyledFormRow>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Service Contract Templates`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Template`}</StyledTh>
                <StyledTh>{t`Duration`}</StyledTh>
                <StyledTh>{t`Skills Required`}</StyledTh>
                <StyledTh>{t`Actions`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {serviceTemplates.map((template) => (
                <tr key={template.name}>
                  <StyledTd>{template.name}</StyledTd>
                  <StyledTd>{template.duration}</StyledTd>
                  <StyledTd>{template.skillsRequired}</StyledTd>
                  <StyledTd>
                    <StyledButton variant="secondary">{t`Edit`}</StyledButton>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledButton>{t`Save Settings`}</StyledButton>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
