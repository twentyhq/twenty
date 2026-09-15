import { type PlaybookSkill } from 'src/modules/opportunity/how-to-process/constants/playbook-skills';
import { PlaybookMarkedText } from 'src/modules/opportunity/how-to-process/front-components/playbook-marked-text';
import { PlaybookNavLink } from 'src/modules/opportunity/how-to-process/front-components/playbook-nav-link';
import { PlaybookSkillBlock } from 'src/modules/opportunity/how-to-process/front-components/playbook-skill-block';
import { type PlaybookStep } from 'src/modules/opportunity/how-to-process/types/playbook-step.type';
import { type PlaybookLink } from 'src/modules/opportunity/how-to-process/utils/playbook-nav';
import { PLAYBOOK_STYLES as styles } from 'src/modules/shared/front-components/playbook-styles';

type PlaybookArticleProps = {
  kicker: string;
  title: string;
  lede: string;
  steps: PlaybookStep[];
  headerLinks?: ReadonlyArray<PlaybookLink>;
  bodyLinks?: ReadonlyArray<PlaybookLink>;
  skills?: ReadonlyArray<PlaybookSkill>;
};

export const PlaybookArticle = ({
  kicker,
  title,
  lede,
  steps,
  headerLinks,
  bodyLinks = [],
  skills = [],
}: PlaybookArticleProps) => (
  <div style={styles.root}>
    <article style={styles.article}>
      <p style={styles.kicker}>{kicker}</p>
      <h1 style={styles.title}>{title}</h1>
      <p style={headerLinks !== undefined ? styles.ledeWithLinks : styles.lede}>
        <PlaybookMarkedText text={lede} links={bodyLinks} skills={skills} />
      </p>
      {headerLinks !== undefined ? (
        <nav style={styles.headerLinkRow}>
          {headerLinks.map((link) => (
            <PlaybookNavLink key={link.label} link={link}>
              {link.label}
            </PlaybookNavLink>
          ))}
        </nav>
      ) : null}
      {steps.map((step, index) => (
        <section
          key={step.num}
          style={index === steps.length - 1 ? styles.lastStep : styles.step}
        >
          <div style={styles.num}>{step.num}</div>
          <div>
            <h2 style={styles.heading}>{step.heading}</h2>
            <p style={styles.body}>
              <PlaybookMarkedText
                text={step.body}
                links={bodyLinks}
                skills={skills}
              />
            </p>
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
                  <li key={bullet}>
                    <PlaybookMarkedText
                      text={bullet}
                      links={bodyLinks}
                      skills={skills}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            {step.skills !== undefined
              ? step.skills.map((skill) => (
                  <PlaybookSkillBlock key={skill.name} skill={skill} />
                ))
              : null}
            {step.note !== undefined ? (
              <p style={styles.note}>
                <PlaybookMarkedText
                  text={step.note}
                  links={bodyLinks}
                  skills={skills}
                />
              </p>
            ) : null}
          </div>
        </section>
      ))}
    </article>
  </div>
);
