import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type PasswordResetLinkEmailProps = {
  duration: string;
  link: string;
};

export const PasswordResetLinkEmail = ({
  duration,
  link,
}: PasswordResetLinkEmailProps) => {
  return (
    <BaseEmail>
      <Title value="Redefinir sua senha 🗝" />
      <CallToAction href={link} value="Redefinir" />
      <MainText>
        Este link é válido apenas para os próximos {duration}. Se o link não funcionar,
        você pode usar o link de verificação de login diretamente:
        <br />
        <Link href={link} value={link} />
      </MainText>
    </BaseEmail>
  );
};
