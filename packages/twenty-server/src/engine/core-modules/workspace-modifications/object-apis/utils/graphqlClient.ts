import axios from 'axios';

export async function executeQuery<T>(query: string, variables: Record<string, any>, token: string): Promise<T> {
  try {
    let data = JSON.stringify({
      query: query,
      variables: variables,
    });

    const response = await fetch(process.env.GRAPHQL_URL_METADATA || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });

    const responseObj = await response.json();
    // console.log("Relations responseObj:::", responseObj);
    return responseObj;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

export async function executeGraphQLQuery<T>(query: string, variables: Record<string, any>, token: string): Promise<T> {
  try {
    let data = JSON.stringify({
      query: query,
      variables: variables,
    });

    const response = await fetch(process.env.GRAPHQL_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });

    const responseObj = await response.json();
    // console.log("Relations responseObj:::", responseObj);
    return responseObj;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}
