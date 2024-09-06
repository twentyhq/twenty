import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { HighlightedText } from 'src/components/HighlightedText';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type CleanInactiveWorkspaceEmailProps = {
  daysLeft: number;
  userName: string;
  workspaceDisplayName: string;
};

export const CleanInactiveWorkspaceEmail = ({
  daysLeft,
  userName,
  workspaceDisplayName,
}: CleanInactiveWorkspaceEmailProps) => {
  const dayOrDays = daysLeft > 1 ? 'dias' : 'dia';
  const remainingDays = daysLeft > 1 ? `${daysLeft} ` : '';

  const helloString = userName?.length > 1 ? `Olá ${userName}` : 'Olá';

  return (
    <BaseEmail>
      <Title value="Workspace Inativo 😴" />
      <HighlightedText value={`faltam ${daysLeft} ${dayOrDays}`} />
      <MainText>
        {helloString},
        <br />
        <br />
        Parece que houve um período de inatividade no seu workspace{' '}
        <b>{workspaceDisplayName}</b>.
        <br />
        <br />
        Por favor, note que a conta está prestes a ser desativada em breve, e
        todos os dados associados a este workspace serão excluídos.
        <br />
        <br />
        Sem preocupações! Basta criar ou editar um registro nos próximos{' '}
        {remainingDays} {dayOrDays} para manter o acesso.
      </MainText>
      <CallToAction href="https://crm.digitoservice.com" value="Conectar ao CRM - Digito Service" />
    </BaseEmail>
  );
};

export default CleanInactiveWorkspaceEmail;
