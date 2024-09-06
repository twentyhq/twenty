import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type PasswordUpdateNotifyEmailProps = {
  userName: string;
  email: string;
  link: string;
};

export const PasswordUpdateNotifyEmail = ({
  userName,
  email,
  link,
}: PasswordUpdateNotifyEmailProps) => {
  const helloString = userName?.length > 1 ? `Querido(a) ${userName}` : 'Querido(a)';
  return (
    <BaseEmail>
      <Title value="Senha atualizada" />
      <MainText>
        {helloString},
        <br />
        <br />
        Esta é uma confirmação de que a senha da sua conta ({email}) foi
        alterada com sucesso em {format(new Date(), 'd MMMM yyyy', { locale: ptBR })}.
        <br />
        <br />
        Se você não iniciou essa alteração, entre em contato com o proprietário do
        workspace imediatamente.
        <br />
      </MainText>
      <CallToAction value="Conectar ao CRM - Digito Service" href={link} />
    </BaseEmail>
  );
};
