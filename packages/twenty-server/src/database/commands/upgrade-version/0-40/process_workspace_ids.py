def process_workspace_ids(input_file, output_file):
    # Read workspace IDs from input file
    with open(input_file, 'r') as f:
        workspace_ids = [line.strip() for line in f.readlines()]

    # Process in chunks of 200
    chunk_size = 200
    chunks = [workspace_ids[i:i + chunk_size] for i in range(0, len(workspace_ids), chunk_size)]

    # Write to output file with command format
    with open(output_file, 'w') as f:
        for chunk in chunks:
            command = f"yarn command:prod deleteMany -w {','.join(chunk)}\n"
            f.write(command)

    print(f"Processed {len(workspace_ids)} IDs into {len(chunks)} chunks")

# Usage
input_file = 'workspace_ids.txt'
output_file = 'workspace_ids_chunked.txt'
process_workspace_ids(input_file, output_file) 