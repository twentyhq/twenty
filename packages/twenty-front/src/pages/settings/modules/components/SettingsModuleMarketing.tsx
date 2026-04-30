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

const StyledStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StyledStatCard = styled.div`
  background: ${themeCssVariables.color.background};
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const StyledStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
`;

const StyledStatLabel = styled.div`
  font-size: 0.75rem;
  color: ${themeCssVariables.color.font.secondary};
  margin-top: 4px;
`;

type ScoringRule = {
  action: string;
  points: number;
  description: string;
};

type ChannelConfig = {
  channel: string;
  enabled: boolean;
  budget: string;
};

export const SettingsModuleMarketing = () => {
  const { t } = useLingui();

  const [attributionModel, setAttributionModel] = useState('linear');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  const [scoringRules] = useState<ScoringRule[]>([
    { action: 'Website Visit', points: 5, description: 'Any page visit' },
    { action: 'Form Submission', points: 20, description: 'Contact or demo form' },
    { action: 'Email Open', points: 3, description: 'Marketing email opened' },
    { action: 'Email Click', points: 10, description: 'Link clicked in email' },
    { action: 'Demo Attended', points: 50, description: 'Attended product demo' },
    { action: 'Pricing Page Visit', points: 25, description: 'Viewed pricing page' },
  ]);

  const [channels, setChannels] = useState<ChannelConfig[]>([
    { channel: 'Email', enabled: true, budget: '$80M COP' },
    { channel: 'Social Media', enabled: true, budget: '$120M COP' },
    { channel: 'Paid Search', enabled: true, budget: '$200M COP' },
    { channel: 'Content Marketing', enabled: true, budget: '$60M COP' },
    { channel: 'Events', enabled: false, budget: '$150M COP' },
  ]);

  const handleToggleChannel = (index: number) => {
    setChannels((previous) =>
      previous.map((channel, channelIndex) =>
        channelIndex === index ? { ...channel, enabled: !channel.enabled } : channel,
      ),
    );
  };

  return (
    <SubMenuTopBarContainer
      title={t`Marketing`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Marketing` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Marketing Campaign Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Lead Scoring Rules`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Action`}</StyledTh>
                <StyledTh>{t`Points`}</StyledTh>
                <StyledTh>{t`Description`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {scoringRules.map((rule) => (
                <tr key={rule.action}>
                  <StyledTd>{rule.action}</StyledTd>
                  <StyledTd>+{rule.points}</StyledTd>
                  <StyledTd>{rule.description}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Campaign Channels`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Channel`}</StyledTh>
                <StyledTh>{t`Budget`}</StyledTh>
                <StyledTh>{t`Status`}</StyledTh>
                <StyledTh>{t`Actions`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel, index) => (
                <tr key={channel.channel}>
                  <StyledTd>{channel.channel}</StyledTd>
                  <StyledTd>{channel.budget}</StyledTd>
                  <StyledTd>{channel.enabled ? t`Active` : t`Inactive`}</StyledTd>
                  <StyledTd>
                    <StyledButton
                      variant={channel.enabled ? 'danger' : 'secondary'}
                      onClick={() => handleToggleChannel(index)}
                    >
                      {channel.enabled ? t`Disable` : t`Enable`}
                    </StyledButton>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`UTM Tracking Configuration`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Default UTM Source`}</StyledLabel>
              <StyledInput
                value={utmSource}
                onChange={(event) => setUtmSource(event.target.value)}
                placeholder="twenty-crm"
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Default UTM Medium`}</StyledLabel>
              <StyledInput
                value={utmMedium}
                onChange={(event) => setUtmMedium(event.target.value)}
                placeholder="email"
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Default UTM Campaign`}</StyledLabel>
              <StyledInput
                value={utmCampaign}
                onChange={(event) => setUtmCampaign(event.target.value)}
                placeholder="q2-2026"
              />
            </StyledFormGroup>
          </StyledFormRow>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Attribution Model`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Model`}</StyledLabel>
            <StyledSelect
              value={attributionModel}
              onChange={(event) => setAttributionModel(event.target.value)}
            >
              <option value="first_touch">{t`First Touch`}</option>
              <option value="last_touch">{t`Last Touch`}</option>
              <option value="linear">{t`Linear`}</option>
              <option value="time_decay">{t`Time Decay`}</option>
            </StyledSelect>
          </StyledFormGroup>
          <StyledButton>{t`Save Settings`}</StyledButton>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
