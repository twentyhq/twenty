import { type PlaybookSkill } from 'src/modules/opportunity/how-to-process/constants/playbook-skills';
import { PlaybookNavLink } from 'src/modules/opportunity/how-to-process/front-components/playbook-nav-link';
import { type PlaybookLink } from 'src/modules/opportunity/how-to-process/utils/playbook-nav';
import { splitPlaybookMarks } from 'src/modules/opportunity/how-to-process/utils/split-playbook-marks';
import { PLAYBOOK_STYLES as styles } from 'src/modules/shared/front-components/playbook-styles';

type PlaybookMarkedTextProps = {
  text: string;
  links?: ReadonlyArray<PlaybookLink>;
  skills?: ReadonlyArray<PlaybookSkill>;
};

export const PlaybookMarkedText = ({
  text,
  links = [],
  skills = [],
}: PlaybookMarkedTextProps) => (
  <>
    {splitPlaybookMarks(text, { links, skills }).map((mark, index) => {
      if (mark.kind === 'skill') {
        return (
          <a
            key={`${mark.value}-${index}`}
            href={mark.githubUrl}
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            <code style={styles.code}>{mark.value}</code>
          </a>
        );
      }

      if (mark.kind === 'link') {
        return (
          <PlaybookNavLink key={`${mark.value}-${index}`} link={mark.link}>
            {mark.value}
          </PlaybookNavLink>
        );
      }

      return <span key={`text-${index}`}>{mark.value}</span>;
    })}
  </>
);
