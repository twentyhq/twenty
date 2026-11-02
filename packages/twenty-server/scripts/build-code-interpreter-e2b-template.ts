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
    'pdf2image==1.17.0',
    'pdfplumber==0.11.10',
    'pymupdf==2.0',
    'pypdf==6.21.4',
    'PyPDF2==3.0.1',
    'python-pptx==1.0.2',
    'reportlab==5.1.0',
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
