import { type PlaybookSkill } from 'src/modules/opportunity/how-to-process/constants/playbook-skills';
import { PLAYBOOK_STYLES as styles } from 'src/modules/shared/front-components/playbook-styles';

type PlaybookSkillBlockProps = {
  skill: PlaybookSkill;
};

export const PlaybookSkillBlock = ({ skill }: PlaybookSkillBlockProps) => (
  <div style={styles.skill}>
    <p style={styles.skillKicker}>Run locally</p>
    <p style={styles.body}>
      <code style={styles.code}>{skill.trigger}</code>
      {' · '}
      <a
        href={skill.githubUrl}
        target="_blank"
        rel="noreferrer"
        style={styles.link}
      >
        View on GitHub
      </a>
    </p>
    <ul style={styles.skillOutputs}>
      {skill.outputs.map((output) => (
        <li key={output}>{output}</li>
      ))}
    </ul>
  </div>
);
