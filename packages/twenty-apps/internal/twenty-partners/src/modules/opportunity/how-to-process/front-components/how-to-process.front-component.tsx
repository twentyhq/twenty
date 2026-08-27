import { defineFrontComponent } from 'twenty-sdk/define';

import { HOW_TO_PROCESS_FRONT_COMPONENT_ID } from 'src/modules/opportunity/how-to-process/constants/how-to-process.constants';
import {
  HOW_TO_PROCESS_KICKER,
  HOW_TO_PROCESS_LEDE,
  HOW_TO_PROCESS_STEPS,
  HOW_TO_PROCESS_TITLE,
} from 'src/modules/opportunity/how-to-process/constants/admin-copy';
import { PLAYBOOK_STYLES as styles } from 'src/modules/shared/front-components/playbook-styles';

const HowToProcess = () => (
  <div style={styles.root}>
    <article style={styles.article}>
      <p style={styles.kicker}>{HOW_TO_PROCESS_KICKER}</p>
      <h1 style={styles.title}>{HOW_TO_PROCESS_TITLE}</h1>
      <p style={styles.lede}>{HOW_TO_PROCESS_LEDE}</p>
      {HOW_TO_PROCESS_STEPS.map((step) => (
        <section
          key={step.num}
          style={step.variant === 'lastStep' ? styles.lastStep : styles.step}
        >
          <div style={styles.num}>{step.num}</div>
          <div>
            <h2 style={styles.heading}>{step.heading}</h2>
            <p style={styles.body}>{step.body}</p>
            {step.pills !== undefined ? (
              <div style={styles.pillRow}>
                {step.pills.map((pill) => (
                  <span key={pill} style={styles.pill}>
                    {pill}
                  </span>
                ))}
              </div>
            ) : null}
            {step.bullets !== undefined ? (
              <ul style={styles.list}>
                {step.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {step.note !== undefined ? (
              <p style={styles.note}>{step.note}</p>
            ) : null}
          </div>
        </section>
      ))}
    </article>
  </div>
);

export default defineFrontComponent({
  universalIdentifier: HOW_TO_PROCESS_FRONT_COMPONENT_ID,
  name: 'How to process',
  description:
    'Admin playbook for the opportunity path in Matching Admin Workspace.',
  component: HowToProcess,
});
