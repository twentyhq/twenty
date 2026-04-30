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

const StyledTabBar = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 2px solid ${themeCssVariables.color.border};
  margin-bottom: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    overflow-x: auto;
  }
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: ${(props) => (props.isActive ? '#3b82f6' : 'inherit')};
  border-bottom: 2px solid ${(props) => (props.isActive ? '#3b82f6' : 'transparent')};
  margin-bottom: -2px;
  transition: color 0.2s;

  &:hover {
    color: #3b82f6;
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

type CountryCode = 'CO' | 'MX' | 'DO' | 'CL' | 'PE';

type CountryConfig = {
  code: CountryCode;
  name: string;
  taxAuthority: string;
  invoicePrefix: string;
  currentSequence: number;
  resolutionNumber: string;
  testMode: boolean;
  certificateUploaded: boolean;
  taxRules: Array<{ name: string; rate: string; applies: string }>;
};

export const SettingsModuleFiscal = () => {
  const { t } = useLingui();

  const [activeCountry, setActiveCountry] = useState<CountryCode>('CO');

  const [countries, setCountries] = useState<Record<CountryCode, CountryConfig>>({
    CO: {
      code: 'CO',
      name: 'Colombia',
      taxAuthority: 'DIAN',
      invoicePrefix: 'FE',
      currentSequence: 18542,
      resolutionNumber: '18764003002541',
      testMode: false,
      certificateUploaded: true,
      taxRules: [
        { name: 'IVA General', rate: '19%', applies: 'Most goods & services' },
        { name: 'IVA Reduced', rate: '5%', applies: 'Basic goods' },
        { name: 'ReteFuente', rate: '2.5%', applies: 'Services > $1,070,000' },
        { name: 'ICA Bogota', rate: '0.966%', applies: 'Commercial activities' },
      ],
    },
    MX: {
      code: 'MX',
      name: 'Mexico',
      taxAuthority: 'SAT',
      invoicePrefix: 'CFDI',
      currentSequence: 7823,
      resolutionNumber: 'CSD-2026-001',
      testMode: true,
      certificateUploaded: false,
      taxRules: [
        { name: 'IVA', rate: '16%', applies: 'General' },
        { name: 'ISR', rate: '30%', applies: 'Income tax' },
        { name: 'IEPS', rate: 'Variable', applies: 'Special products' },
      ],
    },
    DO: {
      code: 'DO',
      name: 'Dominican Republic',
      taxAuthority: 'DGII',
      invoicePrefix: 'NCF',
      currentSequence: 3214,
      resolutionNumber: 'B0100000001',
      testMode: true,
      certificateUploaded: false,
      taxRules: [
        { name: 'ITBIS', rate: '18%', applies: 'General' },
        { name: 'ISR', rate: '27%', applies: 'Income' },
      ],
    },
    CL: {
      code: 'CL',
      name: 'Chile',
      taxAuthority: 'SII',
      invoicePrefix: 'DTE',
      currentSequence: 5610,
      resolutionNumber: 'SII-2026-0045',
      testMode: false,
      certificateUploaded: true,
      taxRules: [
        { name: 'IVA', rate: '19%', applies: 'General' },
        { name: 'PPM', rate: '1%', applies: 'Monthly provisional' },
      ],
    },
    PE: {
      code: 'PE',
      name: 'Peru',
      taxAuthority: 'SUNAT',
      invoicePrefix: 'F',
      currentSequence: 2190,
      resolutionNumber: 'SUNAT-2026-789',
      testMode: true,
      certificateUploaded: false,
      taxRules: [
        { name: 'IGV', rate: '18%', applies: 'General' },
        { name: 'IR', rate: '29.5%', applies: 'Income' },
        { name: 'Detraccion', rate: '12%', applies: 'Selected services' },
      ],
    },
  });

  const activeConfig = countries[activeCountry];

  const handleToggleTestMode = () => {
    setCountries((previous) => ({
      ...previous,
      [activeCountry]: {
        ...previous[activeCountry],
        testMode: !previous[activeCountry].testMode,
      },
    }));
  };

  return (
    <SubMenuTopBarContainer
      title={t`Fiscal & Tax`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Fiscal & Tax` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Fiscal & Tax Configuration`}</StyledTitle>

        <StyledTabBar>
          {(Object.keys(countries) as CountryCode[]).map((code) => (
            <StyledTab
              key={code}
              isActive={activeCountry === code}
              onClick={() => setActiveCountry(code)}
            >
              {countries[code].name} ({code})
            </StyledTab>
          ))}
        </StyledTabBar>

        <StyledSection>
          <StyledSectionTitle>
            {activeConfig.name} - {activeConfig.taxAuthority}
          </StyledSectionTitle>

          <StyledFormGroup>
            <StyledLabel>{t`Certificate`}</StyledLabel>
            <StyledFormRow>
              <span style={{ fontSize: '0.85rem' }}>
                <StyledStatusDot
                  status={activeConfig.certificateUploaded ? 'connected' : 'error'}
                />
                {activeConfig.certificateUploaded ? t`Certificate uploaded` : t`No certificate`}
              </span>
              <StyledButton variant="secondary">
                {activeConfig.certificateUploaded ? t`Replace Certificate` : t`Upload Certificate`}
              </StyledButton>
            </StyledFormRow>
          </StyledFormGroup>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Invoice Configuration`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Invoice Prefix`}</StyledLabel>
              <StyledInput
                value={activeConfig.invoicePrefix}
                readOnly
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Current Sequence`}</StyledLabel>
              <StyledInput
                type="number"
                value={activeConfig.currentSequence}
                readOnly
              />
            </StyledFormGroup>
          </StyledFormRow>
          <StyledFormGroup>
            <StyledLabel>{t`Resolution / Authorization Number`}</StyledLabel>
            <StyledInput
              value={activeConfig.resolutionNumber}
              readOnly
            />
          </StyledFormGroup>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Test Mode`}</StyledLabel>
              <StyledButton
                variant={activeConfig.testMode ? 'danger' : 'secondary'}
                onClick={handleToggleTestMode}
              >
                {activeConfig.testMode ? t`Test Mode ON` : t`Test Mode OFF`}
              </StyledButton>
            </StyledFormGroup>
          </StyledFormRow>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Tax Rules`} - {activeConfig.name}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Tax`}</StyledTh>
                <StyledTh>{t`Rate`}</StyledTh>
                <StyledTh>{t`Applies To`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {activeConfig.taxRules.map((rule) => (
                <tr key={rule.name}>
                  <StyledTd>{rule.name}</StyledTd>
                  <StyledTd>{rule.rate}</StyledTd>
                  <StyledTd>{rule.applies}</StyledTd>
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
