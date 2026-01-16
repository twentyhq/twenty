import type { Template } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { line, table, text } from '@pdfme/schemas';
import { defineFunction } from 'twenty-sdk';
import { Company, Prestation, Project } from '../../generated';

// Default pdfme template for invoices
const getDefaultTemplate = (): Template => ({
  basePdf: {
    width: 210,
    height: 297,
    padding: [20, 20, 20, 20],
  },
  schemas: [
    [
      // Company Header
      {
        name: 'companyName',
        type: 'text',
        position: { x: 20, y: 20 },
        width: 100,
        height: 10,
        fontSize: 16,
        fontWeight: 'bold',
      },
      {
        name: 'companyAddress',
        type: 'text',
        position: { x: 20, y: 32 },
        width: 100,
        height: 20,
        fontSize: 10,
      },
      // Invoice Info
      {
        name: 'invoiceTitle',
        type: 'text',
        position: { x: 140, y: 20 },
        width: 50,
        height: 10,
        fontSize: 18,
        fontWeight: 'bold',
      },
      {
        name: 'invoiceNumber',
        type: 'text',
        position: { x: 140, y: 32 },
        width: 50,
        height: 8,
        fontSize: 10,
      },
      {
        name: 'invoiceDate',
        type: 'text',
        position: { x: 140, y: 42 },
        width: 50,
        height: 8,
        fontSize: 10,
      },
      // Separator Line
      {
        name: 'separatorLine',
        type: 'line',
        position: { x: 20, y: 60 },
        width: 170,
        height: 1,
        color: '#000000',
      },
      // Project Info
      {
        name: 'projectLabel',
        type: 'text',
        position: { x: 20, y: 70 },
        width: 30,
        height: 8,
        fontSize: 10,
        fontWeight: 'bold',
      },
      {
        name: 'projectName',
        type: 'text',
        position: { x: 50, y: 70 },
        width: 100,
        height: 8,
        fontSize: 10,
      },
      {
        name: 'projectDescription',
        type: 'text',
        position: { x: 20, y: 80 },
        width: 170,
        height: 15,
        fontSize: 9,
      },
      // Items Table
      {
        name: 'itemsTable',
        type: 'table',
        position: { x: 20, y: 100 },
        width: 170,
        height: 100,
        content: '',
        showHead: true,
        head: ['Service', 'Description', 'Unit Price (€)'],
        headWidthPercentages: [30, 50, 20],
        tableStyles: {
          borderWidth: 0.5,
          borderColor: '#000000',
        },
        headStyles: {
          alignment: 'left',
          verticalAlignment: 'middle',
          fontSize: 10,
          lineHeight: 1,
          characterSpacing: 0,
          fontColor: '#000000',
          backgroundColor: '#f0f0f0',
          borderColor: '#000000',
          borderWidth: { top: 0.2, right: 0.2, bottom: 0.2, left: 0.2 },
          padding: { top: 2, right: 2, bottom: 2, left: 2 },
        },
        bodyStyles: {
          alignment: 'left',
          verticalAlignment: 'middle',
          fontSize: 9,
          lineHeight: 1,
          characterSpacing: 0,
          fontColor: '#000000',
          backgroundColor: '#ffffff',
          alternateBackgroundColor: '#fafafa',
          borderColor: '#000000',
          borderWidth: { top: 0.2, right: 0.2, bottom: 0.2, left: 0.2 },
          padding: { top: 2, right: 2, bottom: 2, left: 2 },
        },
        columnStyles: {
          alignment: {
            0: 'left',
            1: 'left',
            2: 'right',
          },
        },
      },
      // Totals Section
      {
        name: 'subtotalLabel',
        type: 'text',
        position: { x: 120, y: 210 },
        width: 40,
        height: 8,
        fontSize: 10,
      },
      {
        name: 'subtotalValue',
        type: 'text',
        position: { x: 160, y: 210 },
        width: 30,
        height: 8,
        fontSize: 10,
        alignment: 'right',
      },
      {
        name: 'discountLabel',
        type: 'text',
        position: { x: 120, y: 220 },
        width: 40,
        height: 8,
        fontSize: 10,
      },
      {
        name: 'discountValue',
        type: 'text',
        position: { x: 160, y: 220 },
        width: 30,
        height: 8,
        fontSize: 10,
        alignment: 'right',
      },
      // Total Line
      {
        name: 'totalLine',
        type: 'line',
        position: { x: 120, y: 230 },
        width: 70,
        height: 1,
        color: '#000000',
      },
      {
        name: 'totalLabel',
        type: 'text',
        position: { x: 120, y: 235 },
        width: 40,
        height: 10,
        fontSize: 12,
        fontWeight: 'bold',
      },
      {
        name: 'totalValue',
        type: 'text',
        position: { x: 160, y: 235 },
        width: 30,
        height: 10,
        fontSize: 12,
        fontWeight: 'bold',
        alignment: 'right',
      },
    ],
  ],
});

interface GenerateInvoiceParams {
  templateId?: string;
  projectId: string;
}

export const handler = async (params: GenerateInvoiceParams) => {
  console.log('Generating invoice... (3)');
  const { templateId, projectId } = params;

  // Import the generated Twenty client dynamically
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Twenty = require('../../generated').default;
  const client = new Twenty();

  // Fetch project with prestations (relation to be added manually)
  const projectResult = await client.query({
    project: {
      __args: { filter: { id: { eq: projectId } } },
      id: true,
      name: true,
      description: true,
      discount: true,
      companyId: true,
      company: {
        id: true,
        name: true,
        address: {
          addressStreet1: true,
          addressStreet2: true,
          addressCity: true,
          addressPostcode: true,
          addressCountry: true,
        },
      },
    },
  });

  const project: Project | null = projectResult.project;
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Fetch project prestations (junction table)
const projectPrestationsResult = await client.query({
  projectPrestations: {
    __args: { filter: { projectId: { eq: projectId } } },
    edges: {
      node: {
        id: true,
        prestation: {
          id: true,
          name: true,
          description: true,
          unitPrice: true,
        },
      },
    },
  },
});

console.log('projectPrestationsResult**', projectPrestationsResult);

const prestationIds = projectPrestationsResult.projectPrestations?.edges?.map(
  (edge: { node: { prestation: { id: string}} }) => edge.node.prestation.id
) ?? [];

console.log('prestationIds**', prestationIds);

// Fetch all prestations for this project
const prestations: Prestation[] = [];

if (prestationIds.length > 0) {
  const prestationsResult = await client.query({
    prestations: {
      __args: { filter: { id: { in: prestationIds } } },
      edges: {
        node: {
          id: true,
          name: true,
          description: true,
          unitPrice: true,
        },
      },
    },
  });

  prestationsResult?.prestations?.edges?.forEach((edge: { node: Prestation }) => {
    const prestation = edge.node;

    prestations.push({
      ...prestation,
    });
  });
}

console.log('prestations**', prestations);

  const company: Company | null = project.company ?? null;
  const companyId = project.companyId ?? company?.id ?? null;

  if (!companyId) {
    throw new Error(`Project has no companyId: ${projectId}`);
  }

  if (!company) {
    throw new Error(`Company not found for project: ${projectId}`);
  }

  // Optionally fetch custom template
  let pdfTemplate = getDefaultTemplate();
  if (templateId) {
    const templateResult = await client.query({
      invoiceTemplate: {
        __args: { filter: { id: { eq: templateId } } },
        edges: {
          node: {
            id: true,
            name: true,
            template: true,
          },
        },
      },
    });

    const customTemplate = templateResult.invoiceTemplate?.edges?.[0]?.node;
    if (customTemplate?.template) {
      try {
        pdfTemplate = JSON.parse(customTemplate.template) as Template;
      } catch {
        console.warn('Failed to parse custom template, using default');
      }
    }
  }

  // Calculate totals
  const subtotal = prestations.reduce((sum, p) => sum + (p.unitPrice || 0), 0);
  const discountAmount = subtotal * ((project.discount || 0) / 100);
  const total = subtotal - discountAmount;

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}`;
  const invoiceDate = new Date().toLocaleDateString('fr-FR');

  // Format company address
  const addressParts = [
    company.address?.addressStreet1,
    company.address?.addressStreet2,
    `${company.address?.addressPostcode || ''} ${company.address?.addressCity || ''}`.trim(),
    company.address?.addressCountry,
  ].filter(Boolean);
  const companyAddress = addressParts.join('\n');

  // Prepare table data for prestations
  const tableBody = prestations.map((p) => [
    p.name || '',
    p.description || '',
    `${(p.unitPrice || 0).toFixed(2)} €`,
  ]);

  // Prepare inputs for pdfme
  const inputs = [
    {
      companyName: company.name || '',
      companyAddress: companyAddress,
      invoiceTitle: 'INVOICE',
      invoiceNumber: invoiceNumber,
      invoiceDate: `Date: ${invoiceDate}`,
      separatorLine: '',
      projectLabel: 'Project:',
      projectName: project.name || '',
      projectDescription: project.description || '',
      itemsTable: JSON.stringify(tableBody),
      subtotalLabel: 'Subtotal:',
      subtotalValue: `${subtotal.toFixed(2)} €`,
      discountLabel: `Discount (${project.discount || 0}%):`,
      discountValue: `-${discountAmount.toFixed(2)} €`,
      totalLine: '',
      totalLabel: 'TOTAL:',
      totalValue: `${total.toFixed(2)} €`,
    },
  ];

  // Generate PDF using pdfme
  const plugins = { text, line, table };
  const pdf = await generate({
    template: pdfTemplate,
    inputs,
    plugins,
  });

  // Convert PDF to base64 for storage
  const pdfBuffer = Buffer.from(pdf);
  const filename = `invoice-${project.name}-${invoiceNumber}.pdf`;

  // Create the invoice record first (to get the ID)
  const createInvoiceResult = await client.mutation({
    createInvoice: {
      __args: {
        data: {
          name: `${project.name} - ${invoiceNumber}`,
          date: new Date().toISOString(),
          status: 'DRAFT',
          totalAmount: total,
        },
      },
      id: true,
      name: true,
      totalAmount: true,
    },
  });

  const invoiceId = createInvoiceResult.createInvoice.id;
  console.log('Invoice created:', invoiceId);


   // Upload the PDF file
  const { path: filePath } = await client.uploadFile(
    pdfBuffer,
    filename,
    'application/pdf',
    'Attachment',
  );

  // Create attachment linked to the invoice
  const createAttachmentResult = await client.mutation({
    createAttachment: {
      __args: {
        data: {
          name: filename,
          fullPath: filePath,
          invoiceId: invoiceId,
        },
      },
      id: true,
      name: true,
      fullPath: true,
    },
  });

  return {
    success: true,
    invoice: createInvoiceResult.createInvoice,
    attachment: createAttachmentResult.createAttachment,
    pdfSize: pdf.length,
    message: `Invoice ${invoiceNumber} generated successfully with attachment`,
  };
};

export default defineFunction({
  universalIdentifier: 'e5f6a7b8-9abc-4ef0-d123-555555555551',
  handler,
  name: 'generate-invoice',
  timeoutSeconds: 30,
  triggers: [
    {
      universalIdentifier: 'e5f6a7b8-9abc-4ef0-d123-555555555552',
      type: 'route',
      path: '/invoice/generate',
      httpMethod: 'POST',
      isAuthRequired: false,
    },
  ],
});

