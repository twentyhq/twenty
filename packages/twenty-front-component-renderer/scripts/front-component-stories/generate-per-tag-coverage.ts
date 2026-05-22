import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlTagDir = path.resolve(dirname, '../../src/__stories__/html-tag');

type EventCoverage = 'click' | 'focus-blur';

type PropertyVariant = {
  scenarioSuffix: string;
  variant: string;
  extraAttributes?: Record<string, string>;
  extraProperties?: Record<string, string | number | boolean>;
};

type TagSpec = {
  tag: string;
  category: string;
  storyTitleCategory: string;
  events: EventCoverage[];
  propertyVariants?: PropertyVariant[];
};

const COMMON_PROPS = (): PropertyVariant[] => [
  { scenarioSuffix: 'properties', variant: '__SELF__' },
];

const TAG_SPECS: TagSpec[] = [
  {
    tag: 'span',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click', 'focus-blur'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'strong',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'em',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'small',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'code',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'b',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'i',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'u',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 's',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'mark',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'sub',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'sup',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'abbr',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'cite',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'kbd',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'samp',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'var',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'dfn',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'bdi',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'bdo',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'data',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'del',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'ins',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'q',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'time',
    category: 'text-inline',
    storyTitleCategory: 'TextInline',
    events: ['click'],
  },
  {
    tag: 'section',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click', 'focus-blur'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'article',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click', 'focus-blur'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'header',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'footer',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'main',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'nav',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click', 'focus-blur'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'aside',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'hgroup',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click'],
  },
  {
    tag: 'address',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click'],
  },
  {
    tag: 'search',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click'],
  },
  {
    tag: 'h1',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click', 'focus-blur'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'h2',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click'],
  },
  {
    tag: 'h3',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click'],
  },
  {
    tag: 'h4',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click'],
  },
  {
    tag: 'h5',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click'],
  },
  {
    tag: 'h6',
    category: 'sectioning',
    storyTitleCategory: 'Sectioning',
    events: ['click'],
  },
  {
    tag: 'p',
    category: 'text',
    storyTitleCategory: 'Text',
    events: ['click', 'focus-blur'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'pre',
    category: 'text',
    storyTitleCategory: 'Text',
    events: ['click'],
  },
  {
    tag: 'blockquote',
    category: 'text',
    storyTitleCategory: 'Text',
    events: ['click'],
  },
  {
    tag: 'ul',
    category: 'list',
    storyTitleCategory: 'List',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'ol',
    category: 'list',
    storyTitleCategory: 'List',
    events: ['click'],
  },
  {
    tag: 'li',
    category: 'list',
    storyTitleCategory: 'List',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'dl',
    category: 'list',
    storyTitleCategory: 'List',
    events: ['click'],
  },
  {
    tag: 'dt',
    category: 'list',
    storyTitleCategory: 'List',
    events: ['click'],
  },
  {
    tag: 'dd',
    category: 'list',
    storyTitleCategory: 'List',
    events: ['click'],
  },
  {
    tag: 'menu',
    category: 'list',
    storyTitleCategory: 'List',
    events: ['click'],
  },
  {
    tag: 'figure',
    category: 'grouping',
    storyTitleCategory: 'Grouping',
    events: ['click'],
  },
  {
    tag: 'figcaption',
    category: 'grouping',
    storyTitleCategory: 'Grouping',
    events: ['click'],
  },
  {
    tag: 'ruby',
    category: 'grouping',
    storyTitleCategory: 'Grouping',
    events: ['click'],
  },
  {
    tag: 'rt',
    category: 'grouping',
    storyTitleCategory: 'Grouping',
    events: ['click'],
  },
  {
    tag: 'rp',
    category: 'grouping',
    storyTitleCategory: 'Grouping',
    events: ['click'],
  },
  {
    tag: 'hr',
    category: 'text',
    storyTitleCategory: 'Text',
    events: ['click'],
  },
  {
    tag: 'a',
    category: 'interactive',
    storyTitleCategory: 'Interactive',
    events: ['click', 'focus-blur'],
    propertyVariants: [
      {
        scenarioSuffix: 'properties',
        variant: 'a',
        extraAttributes: { href: 'https://example.com/probe' },
      },
    ],
  },
  {
    tag: 'details',
    category: 'interactive',
    storyTitleCategory: 'Interactive',
    events: ['click', 'focus-blur'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'summary',
    category: 'interactive',
    storyTitleCategory: 'Interactive',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'dialog',
    category: 'interactive',
    storyTitleCategory: 'Interactive',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'label',
    category: 'form',
    storyTitleCategory: 'Form',
    events: ['click'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'fieldset',
    category: 'form',
    storyTitleCategory: 'Form',
    events: ['click', 'focus-blur'],
    propertyVariants: COMMON_PROPS(),
  },
  {
    tag: 'legend',
    category: 'form',
    storyTitleCategory: 'Form',
    events: ['click'],
  },
  {
    tag: 'output',
    category: 'form',
    storyTitleCategory: 'Form',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'progress',
    category: 'form',
    storyTitleCategory: 'Form',
    events: ['click', 'focus-blur'],
    propertyVariants: [
      {
        scenarioSuffix: 'properties',
        variant: 'progress',
        extraAttributes: { value: '30', max: '100' },
      },
    ],
  },
  {
    tag: 'meter',
    category: 'form',
    storyTitleCategory: 'Form',
    events: ['click', 'focus-blur'],
    propertyVariants: [
      {
        scenarioSuffix: 'properties',
        variant: 'meter',
        extraAttributes: { value: '0.5', min: '0', max: '1' },
      },
    ],
  },
  {
    tag: 'option',
    category: 'form',
    storyTitleCategory: 'Form',
    events: ['click'],
  },
  {
    tag: 'optgroup',
    category: 'form',
    storyTitleCategory: 'Form',
    events: ['click'],
  },
  {
    tag: 'datalist',
    category: 'form',
    storyTitleCategory: 'Form',
    events: ['click'],
  },
  {
    tag: 'table',
    category: 'table',
    storyTitleCategory: 'Table',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'thead',
    category: 'table',
    storyTitleCategory: 'Table',
    events: ['click'],
  },
  {
    tag: 'tbody',
    category: 'table',
    storyTitleCategory: 'Table',
    events: ['click'],
  },
  {
    tag: 'tfoot',
    category: 'table',
    storyTitleCategory: 'Table',
    events: ['click'],
  },
  {
    tag: 'tr',
    category: 'table',
    storyTitleCategory: 'Table',
    events: ['click'],
  },
  {
    tag: 'th',
    category: 'table',
    storyTitleCategory: 'Table',
    events: ['click'],
  },
  {
    tag: 'td',
    category: 'table',
    storyTitleCategory: 'Table',
    events: ['click'],
  },
  {
    tag: 'caption',
    category: 'table',
    storyTitleCategory: 'Table',
    events: ['click'],
  },
  {
    tag: 'colgroup',
    category: 'table',
    storyTitleCategory: 'Table',
    events: ['click'],
  },
  {
    tag: 'img',
    category: 'embedded',
    storyTitleCategory: 'Embedded',
    events: ['click', 'focus-blur'],
    propertyVariants: [
      {
        scenarioSuffix: 'properties',
        variant: 'img',
        extraAttributes: {
          src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"/>',
          alt: 'subject-alt',
        },
      },
    ],
  },
  {
    tag: 'picture',
    category: 'embedded',
    storyTitleCategory: 'Embedded',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'iframe',
    category: 'embedded',
    storyTitleCategory: 'Embedded',
    events: ['click', 'focus-blur'],
  },
  {
    tag: 'svg',
    category: 'svg',
    storyTitleCategory: 'Svg',
    events: ['click', 'focus-blur'],
  },
  { tag: 'g', category: 'svg', storyTitleCategory: 'Svg', events: ['click'] },
  {
    tag: 'circle',
    category: 'svg',
    storyTitleCategory: 'Svg',
    events: ['click'],
  },
  {
    tag: 'ellipse',
    category: 'svg',
    storyTitleCategory: 'Svg',
    events: ['click'],
  },
  {
    tag: 'rect',
    category: 'svg',
    storyTitleCategory: 'Svg',
    events: ['click'],
  },
  {
    tag: 'line',
    category: 'svg',
    storyTitleCategory: 'Svg',
    events: ['click'],
  },
  {
    tag: 'path',
    category: 'svg',
    storyTitleCategory: 'Svg',
    events: ['click'],
  },
  {
    tag: 'polygon',
    category: 'svg',
    storyTitleCategory: 'Svg',
    events: ['click'],
  },
  {
    tag: 'polyline',
    category: 'svg',
    storyTitleCategory: 'Svg',
    events: ['click'],
  },
];

const RESERVED_NAMES = new Set([
  'var',
  'data',
  'header',
  'footer',
  'main',
  'menu',
  'output',
  'label',
  'small',
  'time',
  'meter',
  'progress',
  'section',
  'article',
  'address',
  'figure',
  'figcaption',
  'fieldset',
  'details',
  'summary',
  'dialog',
  'table',
  'caption',
  'iframe',
  'picture',
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
]);

const toPascal = (tag: string): string => {
  const safe = RESERVED_NAMES.has(tag) ? `${tag}Tag` : tag;
  return safe.charAt(0).toUpperCase() + safe.slice(1);
};

const writeFrontComponent = (spec: TagSpec): void => {
  const tagDir = path.join(htmlTagDir, spec.category, spec.tag);
  fs.mkdirSync(tagDir, { recursive: true });

  const needsCoverage = spec.events.length > 0;
  const needsProperties =
    spec.propertyVariants !== undefined && spec.propertyVariants.length > 0;

  const propertyVariants = (spec.propertyVariants ?? []).map((variant) =>
    variant.variant === '__SELF__'
      ? { ...variant, variant: spec.tag }
      : variant,
  );

  const imports: string[] = [
    `import { defineFrontComponent } from 'twenty-sdk/define';`,
    `import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';`,
  ];

  if (needsCoverage) {
    imports.push(
      `import { ElementCoverageScenario } from '../../../../shared/front-components/element-coverage';`,
    );
  }

  imports.push(
    `import {\n  FrontComponentCard,\n  UnknownScenario,\n} from '../../../../shared/front-components/front-component-card';`,
  );

  if (needsProperties) {
    imports.push(
      `import { PropertyReflectionScenario } from '../../../../shared/front-components/property-reflection';`,
    );
  }

  const scenarioBlocks: string[] = [];

  for (const event of spec.events) {
    scenarioBlocks.push(
      `  if (scenarioId === '${spec.tag}:${event}') {\n    return (\n      <FrontComponentCard scenarioId={scenarioId}>\n        <ElementCoverageScenario tag="${spec.tag}" eventName="${event}" />\n      </FrontComponentCard>\n    );\n  }`,
    );
  }

  for (const propertyVariant of propertyVariants) {
    scenarioBlocks.push(
      `  if (scenarioId === '${spec.tag}:${propertyVariant.scenarioSuffix}') {\n    return (\n      <FrontComponentCard scenarioId={scenarioId}>\n        <PropertyReflectionScenario variant="${propertyVariant.variant}" />\n      </FrontComponentCard>\n    );\n  }`,
    );
  }

  const componentName = `${toPascal(spec.tag)}FrontComponent`;

  const componentBody = `${imports.join('\n')}\n\nconst ${componentName} = () => {\n  const scenarioId = useFrontComponentExecutionContext(\n    (context) => context.frontComponentId,\n  );\n\n${scenarioBlocks.join('\n\n')}\n\n  return <UnknownScenario scenarioId={scenarioId} />;\n};\n\nexport default defineFrontComponent({\n  universalIdentifier: 'fc-${spec.tag}-00000000-0000-0000-0000-000000000020',\n  name: '${spec.tag}-front-component',\n  description: 'Front component covering <${spec.tag}> scenarios',\n  component: ${componentName},\n});\n`;

  fs.writeFileSync(
    path.join(tagDir, `${spec.tag}.front-component.tsx`),
    componentBody,
  );
};

const eventStoryExportName = (event: EventCoverage): string =>
  event === 'click' ? 'Click' : 'FocusBlur';

const writeEventsStories = (spec: TagSpec): void => {
  if (spec.events.length === 0) {
    return;
  }

  const tagDir = path.join(htmlTagDir, spec.category, spec.tag);

  const helperImports = spec.events
    .map((event) =>
      event === 'click' ? 'createHtmlTagClickStory' : 'createHtmlTagFocusStory',
    )
    .filter((helper, index, all) => all.indexOf(helper) === index);

  const storyEntries = spec.events.map((event) => {
    const helper =
      event === 'click' ? 'createHtmlTagClickStory' : 'createHtmlTagFocusStory';
    return `export const ${eventStoryExportName(event)} = ${helper}({\n  frontComponentBundleName: '${spec.tag}',\n  tag: '${spec.tag}',\n});`;
  });

  const content = `import { type Meta } from '@storybook/react-vite';\n\nimport { FrontComponentRenderer } from '../../../../host/components/FrontComponentRenderer';\nimport {\n  FRONT_COMPONENT_STORY_DEFAULT_ARGS,\n  resetFrontComponentStoryMocks,\n} from '../../../shared/test-utils/createFrontComponentStoryMeta';\nimport {\n  ${helperImports.join(',\n  ')},\n} from '../../../shared/test-utils/createHtmlElementStory';\n\nconst meta: Meta<typeof FrontComponentRenderer> = {\n  title: 'FrontComponent/HtmlTag/${spec.storyTitleCategory}/${spec.tag.charAt(0).toUpperCase() + spec.tag.slice(1)}/Events',\n  component: FrontComponentRenderer,\n  parameters: { layout: 'centered' },\n  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,\n  beforeEach: resetFrontComponentStoryMocks,\n};\n\nexport default meta;\n\n${storyEntries.join('\n\n')}\n`;

  fs.writeFileSync(
    path.join(tagDir, `${spec.tag}-events.stories.tsx`),
    content,
  );
};

const writePropertiesStories = (spec: TagSpec): void => {
  if (
    spec.propertyVariants === undefined ||
    spec.propertyVariants.length === 0
  ) {
    return;
  }

  const tagDir = path.join(htmlTagDir, spec.category, spec.tag);

  const variants = spec.propertyVariants;

  const exports = variants.map((variant) => {
    const fields: string[] = [
      `frontComponentBundleName: '${spec.tag}'`,
      `scenarioId: '${spec.tag}:${variant.scenarioSuffix}'`,
    ];

    if (variant.extraAttributes !== undefined) {
      const entries = Object.entries(variant.extraAttributes)
        .map(
          ([key, value]) =>
            `    ${JSON.stringify(key)}: ${JSON.stringify(value)}`,
        )
        .join(',\n');
      fields.push(`extraAttributes: {\n${entries},\n  }`);
    }

    if (variant.extraProperties !== undefined) {
      const entries = Object.entries(variant.extraProperties)
        .map(
          ([key, value]) =>
            `    ${JSON.stringify(key)}: ${JSON.stringify(value)}`,
        )
        .join(',\n');
      fields.push(`extraProperties: {\n${entries},\n  }`);
    }

    return `export const Properties = createPropertyReflectionStory({\n  ${fields.join(',\n  ')},\n});`;
  });

  const content = `import { type Meta } from '@storybook/react-vite';\n\nimport { FrontComponentRenderer } from '../../../../host/components/FrontComponentRenderer';\nimport {\n  FRONT_COMPONENT_STORY_DEFAULT_ARGS,\n  resetFrontComponentStoryMocks,\n} from '../../../shared/test-utils/createFrontComponentStoryMeta';\nimport { createPropertyReflectionStory } from '../../../shared/test-utils/createPropertyReflectionStory';\n\nconst meta: Meta<typeof FrontComponentRenderer> = {\n  title: 'FrontComponent/HtmlTag/${spec.storyTitleCategory}/${spec.tag.charAt(0).toUpperCase() + spec.tag.slice(1)}/Properties',\n  component: FrontComponentRenderer,\n  parameters: { layout: 'centered' },\n  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,\n  beforeEach: resetFrontComponentStoryMocks,\n};\n\nexport default meta;\n\n${exports.join('\n\n')}\n`;

  fs.writeFileSync(
    path.join(tagDir, `${spec.tag}-properties.stories.tsx`),
    content,
  );
};

for (const spec of TAG_SPECS) {
  writeFrontComponent(spec);
  writeEventsStories(spec);
  writePropertiesStories(spec);
}

console.log(
  `Scaffolded ${TAG_SPECS.length} per-tag folders under ${htmlTagDir}`,
);
