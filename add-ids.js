const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'packages/twenty-server/src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant.ts');

let content = fs.readFileSync(filePath, 'utf8');

// Find the start of the PEOPLE_DATA_SEEDS array
const startIndex = content.indexOf('export const PEOPLE_DATA_SEEDS = [');
const endIndex = content.lastIndexOf('];');

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find PEOPLE_DATA_SEEDS array');
  process.exit(1);
}

// Get the array content
let arrayContent = content.substring(startIndex, endIndex + 1);

// Split into individual records
const records = arrayContent.split('  {');

// Process each record
const processedRecords = records.map((record, index) => {
  if (index === 0) return record; // Keep the array opening
  
  // Remove any existing id lines
  const lines = record.split('\n').filter(line => !line.trim().startsWith('id:'));
  
  // Add the ID as the first property
  lines.splice(1, 0, `    id: PERSON_DATA_SEED_IDS.ID_${index},`);
  
  return '  {' + lines.join('\n');
});

// Join the records back together
const newContent = processedRecords.join('');

// Replace the array in the file content
content = content.substring(0, startIndex) + newContent + content.substring(endIndex + 1);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added IDs to all records without duplicates'); 