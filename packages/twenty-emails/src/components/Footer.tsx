import { Column, Row } from '@react-email/components';
import { Link } from 'src/components/Link';
import { ShadowText } from 'src/components/ShadowText';

export const Footer = () => {
  return (
    <>
      <Row>
        <Column>
          <ShadowText>
            <Link
              href="https://twenty.com/"
              value="Website"
              aria-label="Visit Twenty's website"
            />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link
              href="https://github.com/twentyhq/twenty"
              value="Github"
              aria-label="Visit Twenty's GitHub repository"
            />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link
              href="https://twenty.com/user-guide"
              value="User guide"
              aria-label="Read Twenty's user guide"
            />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link
              href="https://docs.twenty.com/"
              value="Developers"
              aria-label="Visit Twenty's developer documentation"
            />
          </ShadowText>
        </Column>
      </Row>
      <ShadowText>
        Twenty.com Public Benefit Corporation
        <br />
        2261 Market Street #5275
        <br />
        San Francisco, CA 94114
      </ShadowText>
    </>
  );
};
