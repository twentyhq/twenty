import {
  type PlaybookLink,
  runPlaybookNav,
} from 'src/modules/opportunity/how-to-process/utils/playbook-nav';
import { PLAYBOOK_STYLES as styles } from 'src/modules/shared/front-components/playbook-styles';

type PlaybookNavLinkProps = {
  link: PlaybookLink;
  children: string;
};

export const PlaybookNavLink = ({ link, children }: PlaybookNavLinkProps) => {
  if ('action' in link) {
    return (
      <button
        type="button"
        style={styles.linkButton}
        onClick={() => {
          void runPlaybookNav(link.action);
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <a href={link.href} target="_blank" rel="noreferrer" style={styles.link}>
      {children}
    </a>
  );
};
