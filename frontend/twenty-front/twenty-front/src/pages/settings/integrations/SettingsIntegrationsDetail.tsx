import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['8']};
  padding: ${themeCssVariables.spacing['8']};
  width: 100%;
`;

const Card = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-radius: 8px;
  padding: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 13px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 6px;
  font-size: 14px;
`;

export const SettingsIntegrationsDetail = () => {
  const { t } = useLingui();
  const { integrationId } = useParams();

  return (
    <SubMenuTopBarContainer
      title={t`Configurar Integración`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
        { children: t`Integraciones`, href: getSettingsPath(SettingsPath.Integrations) },
        { children: t`Configurar` },
      ]}
    >
      <StyledContainer>
        <Card>
          <H2Title title={`Configurar ${integrationId}`} />
          <FormGroup>
            <Label>API Key</Label>
            <Input type="password" placeholder="Ingresa tu API key" />
          </FormGroup>
          <FormGroup>
            <Label>Secret</Label>
            <Input type="password" placeholder="Ingresa tu secret" />
          </FormGroup>
          <Button variant="primary" title={t`Guardar Configuración`} />
        </Card>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
