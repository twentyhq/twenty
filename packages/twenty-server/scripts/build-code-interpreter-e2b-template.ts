import { defaultBuildLogger, Template } from '@e2b/code-interpreter';

const templateName = process.argv[2] ?? 'twenty-code-interpreter';

const template = Template()
  .fromTemplate('code-interpreter-v1')
  .aptInstall([
    'poppler-utils',
    'libreoffice-calc',
    'libreoffice-impress',
    'libreoffice-writer',
  ])
  .pipInstall([
    'pdf2image',
    'pdfplumber',
    'pymupdf',
    'pypdf',
    'PyPDF2',
    'python-pptx',
    'reportlab',
  ]);

const main = async (): Promise<void> => {
  const { name } = await Template.build(template, templateName, {
    cpuCount: 2,
    memoryMB: 2048,
    onBuildLogs: defaultBuildLogger(),
  });

  // oxlint-disable-next-line no-console
  console.log(`Built E2B template ${name}, set E2B_TEMPLATE=${name}`);
};

main().catch((error) => {
  // oxlint-disable-next-line no-console
  console.error('E2B template build failed:', error);
  process.exit(1);
});
