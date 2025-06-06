import * as fs from 'fs';
import * as path from 'path';

const targetPath = path.join(
  __dirname,
  '../src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant.ts',
);

// Read the file content
const content = fs.readFileSync(targetPath, 'utf8');

// Find the COMPANY_DATA_SEEDS array
const seedsStart = content.indexOf('export const COMPANY_DATA_SEEDS = [');
const seedsEnd = content.lastIndexOf('];');

if (seedsStart === -1 || seedsEnd === -1) {
  console.error('Could not find COMPANY_DATA_SEEDS array');
  process.exit(1);
}

// Get the seeds array content
const seedsContent = content.slice(
  seedsStart + 'export const COMPANY_DATA_SEEDS = ['.length,
  seedsEnd,
);

// Split into individual company objects
const companies = seedsContent.split('},').filter(Boolean);

// Process each company
const processedCompanies = companies
  .map((company, index) => {
    // Skip if already has an id
    if (company.includes('id:')) {
      return company + '}';
    }

    // Add id as the first property
    const idLine = `    id: COMPANY_DATA_SEED_IDS.ID_${index + 1},\n`;

    // Find the first property line
    const lines = company.split('\n');
    const firstPropIndex = lines.findIndex((line) =>
      line.trim().startsWith('name:'),
    );

    if (firstPropIndex === -1) {
      return company + '}';
    }

    // Insert the id line before the first property
    lines.splice(firstPropIndex, 0, idLine);

    return lines.join('\n') + '}';
  })
  .join(',\n');

// Reconstruct the file content
const newContent =
  content.slice(0, seedsStart) +
  'export const COMPANY_DATA_SEEDS = [\n' +
  processedCompanies +
  '\n];' +
  content.slice(seedsEnd + 1);

// Write back to file
fs.writeFileSync(targetPath, newContent, 'utf8');

console.log('Successfully added IDs to all company data seeds');
