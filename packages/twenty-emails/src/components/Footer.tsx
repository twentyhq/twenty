import { i18n } from '@lingui/core';
import { Column, Container, Row } from '@react-email/components';
import { Link } from 'src/components/Link';
import { ShadowText } from 'src/components/ShadowText';

const footerContainerStyle = {
  marginTop: '12px',
};

export const Footer = () => {
  return (
    <Container style={footerContainerStyle}>
      <Row>
        <Column>
          <ShadowText>
            <Link
              href="https://insuros.ca/"
              value={i18n._('Website')}
              aria-label={i18n._("Visit InsurOS's website")}
            />
          </ShadowText>
        </Column>
      </Row>
    </Container>
  );
};
