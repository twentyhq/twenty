import { type I18n } from '@lingui/core';
import { Column, Container, Row } from '@react-email/components';
import { Link } from 'src/components/Link';
import { ShadowText } from 'src/components/ShadowText';

const footerContainerStyle = {
  marginTop: '12px',
};

type FooterProps = {
  i18n: I18n;
};

export const Footer = ({ i18n }: FooterProps) => {
  return (
    <Container style={footerContainerStyle}>
      <Row>
        <Column>
          <ShadowText>
            <Link
              href="https://controlitfactory.eu/"
              value={i18n._('Website')}
              aria-label={i18n._("Visit Controlit Factory website")}
            />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link
              href="mailto:info@controlitfactory.eu"
              value={i18n._('Contact')}
              aria-label={i18n._('Contact Controlit Factory')}
            />
          </ShadowText>
        </Column>
      </Row>
      <ShadowText>
        <>
          {i18n._('Controlit Factory SIA')}
          <br />
          {i18n._('Jaunmoku iela 34, Riga, LV-1046, Latvia')}
        </>
      </ShadowText>
    </Container>
  );
};
