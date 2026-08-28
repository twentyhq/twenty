import { runPlaybookNav } from 'src/modules/opportunity/how-to-process/utils/playbook-nav';
import { type PlaybookLink } from 'src/modules/opportunity/how-to-process/utils/split-playbook-marks';
import { PLAYBOOK_STYLES as styles } from 'src/modules/shared/front-components/playbook-styles';

type PlaybookNavLinkProps = {
  link: PlaybookLink;
  children: string;
};

export const PlaybookNavLink = ({ link, children }: PlaybookNavLinkProps) => {
  if (link.action !== undefined) {
    const action = link.action;

    return (
      <button
        type="button"
        style={styles.linkButton}
        onClick={() => {
          void runPlaybookNav(action);
        }}
      >
        {children}
      </button>
    );
  }

  if (link.href !== undefined) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        style={styles.link}
      >
        {children}
      </a>
    );
  }

  return <span>{children}</span>;
};
