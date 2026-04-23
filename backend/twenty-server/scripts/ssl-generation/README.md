# Local SSL Certificate Generation Script

This Bash script helps generate self-signed SSL certificates for local development. It uses OpenSSL to create a root certificate authority, a domain certificate, and configures them for local usage.

## Features
- Generates a private key and root certificate.
- Creates a signed certificate for a specified domain.
- Adds the root certificate to the macOS keychain for trusted usage (macOS only).
- Customizable with default values for easier use.

## Requirements
- OpenSSL

## Usage

### Running the Script

To generate certificates using the default values:

```sh
./script.sh
```

### Specifying Custom Values

1. **Domain Name**: Specify the domain name for the certificate. Default is `localhost.com`.
2. **Root Certificate Name**: Specify a name for the root certificate. Default is `myRootCertificate`.
3. **Validity Days**: Specify the number of days the certificate is valid for. Default is `398` days.

#### Examples:

1. **Using Default Values**:
    ```sh
    ./script.sh
    ```

2. **Custom Domain Name**:
    ```sh
    ./script.sh example.com
    ```

3. **Custom Domain Name and Root Certificate Name**:
    ```sh
    ./script.sh example.com customRootCertificate
    ```

4. **Custom Domain Name, Root Certificate Name, and Validity Days**:
    ```sh
    ./script.sh example.com customRootCertificate 398
    ```

## Script Details

1. **Check if OpenSSL is Installed**: Ensures OpenSSL is installed before executing.
2. **Create Directory for Certificates**: Uses `~/certs/{domain}`.
3. **Generate Root Certificate**: Creates a root private key and certificate.
4. **Add Root Certificate to macOS Keychain**: Adds root certificate to macOS trusted store (requires admin privileges).
5. **Generate Domain Key**: Produces a private key for the domain.
6. **Create CSR**: Generates a Certificate Signing Request for the domain.
7. **Generate Signed Certificate**: Signs the domain certificate with the root certificate.

## Output Files

The generated files are stored in `~/certs/{domain}`:

- **Root certificate key**: `{root_cert_name}.key`
- **Root certificate**: `{root_cert_name}.pem`
- **Domain private key**: `{domain}.key`
- **Signed certificate**: `{domain}.crt`

## Notes

- If running on non-macOS systems, you'll need to manually add the root certificate to your trusted certificate store.
- Ensure that OpenSSL is installed and available in your PATH.