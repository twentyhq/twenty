import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title, Section, Button } from 'twenty-ui';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.background.secondary};
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
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 6px;
  font-size: 14px;
`;

export const SettingsIntegrationsDetail = () => {
  const { t } = useTranslation();
  const { integrationId } = useParams();

  return (
    <SubMenuTopBarContainer
      title={t('Configurar Integración')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Integraciones'), href: getSettingsPath(SettingsPath.Integrations) },
        { children: t('Configurar') },
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
          <Button variant="primary">Guardar Configuración</Button>
        </Card>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
