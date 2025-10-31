import axios from 'axios';

type TwentyRecordType = 'notes' | 'tasks';
type RelatedTo = { type: 'Person' | 'Company'; id: string };
type NotePayload = { title: string; body: string; relatedTo: RelatedTo };
type TaskPayload = { title: string; status: 'TODO' | 'DONE'; relatedTo: RelatedTo };

export const createTwentyRecord = async (
  endpoint: TwentyRecordType,
  data: NotePayload | TaskPayload
): Promise<object> => {
  const TWENTY_BASE_URL = process.env.TWENTY_BASE_URL || 'https://unpaid-interns.twenty.com';
  const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
  if (!TWENTY_API_KEY) throw new Error('❌ TWENTY_API_KEY missing');

  const url = `${TWENTY_BASE_URL}/rest/${endpoint}`;
  const relationKey = data.relatedTo.type === 'Person' ? 'persons' : 'companies';

  // ✅ Use correct field name "body" (not noteContent)
  const formattedData =
    endpoint === 'notes'
      ? {
          title: (data as any).title,
          body: (data as any).body,
          [relationKey]: { connect: [{ id: data.relatedTo.id }] },
        }
      : {
          title: (data as any).title,
          status: (data as any).status,
          [relationKey]: { connect: [{ id: data.relatedTo.id }] },
        };

  console.log(`🧠 Sending payload to ${url}:`, JSON.stringify(formattedData, null, 2));

  try {
    const response = await axios.post(url, formattedData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TWENTY_API_KEY}`,
      },
    });
    console.log(`✅ Created ${endpoint}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ ERROR RESPONSE:', error.response?.data || error.message);
    throw new Error(
      `Failed to create Twenty record. Details: ${
        JSON.stringify(error.response?.data || error.message)
      }`
    );
  }
};


